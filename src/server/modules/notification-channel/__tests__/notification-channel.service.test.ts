import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { NotificationChannelService } from "../notification-channel.service";
import { NotificationType } from "../../../../generated/prisma";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../errors/custom-errors";
import { emailService } from "../../shared/email.service";

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn() },
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

const createMockRepository = () => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findByOrganizationId: vi.fn(),
  findActiveByOrganizationId: vi.fn(),
});

describe("NotificationChannelService", () => {
  const mockRepository = createMockRepository();
  const baseCtx = { organizationId: "org-1" } as any;
  const alertData = {
    endpointName: "Payments API",
    endpointUrl: "https://api.example.com/payments",
    status: "ERROR",
    statusCode: 500,
    errorMessage: "Internal Server Error",
    responseTime: 1200,
    timestamp: new Date(),
  };

  let service: NotificationChannelService;
  let sendAlertEmailSpy: ReturnType<typeof vi.spyOn>;
  const fetchMock = vi.fn();
  let originalFetch: typeof globalThis.fetch | undefined;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  afterAll(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as any).fetch;
    }
  });

  beforeEach(() => {
    Object.values(mockRepository).forEach(mock => mock.mockReset());
    sendAlertEmailSpy = vi.spyOn(emailService, "sendAlertEmail");
    sendAlertEmailSpy.mockResolvedValue(true);
    fetchMock.mockReset();
    (globalThis as any).fetch = fetchMock;
    service = new NotificationChannelService(mockRepository as any);
  });

  afterEach(() => {
    sendAlertEmailSpy.mockReset();
    sendAlertEmailSpy.mockRestore();
  });

  it("creates a notification channel when organization matches context", async () => {
    const mockChannel = {
      id: "channel-1",
      organizationId: "org-1",
      name: "Primary alerts",
      type: NotificationType.EMAIL,
      config: JSON.stringify({ emails: ["alerts@example.com"] }),
    };

    mockRepository.create.mockResolvedValue(mockChannel);

    const result = await service.createNotificationChannel({
      input: {
        organizationId: "org-1",
        name: "Primary alerts",
        type: NotificationType.EMAIL,
        config: JSON.stringify({ emails: ["alerts@example.com"] }),
      },
      ctx: baseCtx,
    });

    expect(mockRepository.create).toHaveBeenCalledWith({
      organizationId: "org-1",
      name: "Primary alerts",
      type: NotificationType.EMAIL,
      config: JSON.stringify({ emails: ["alerts@example.com"] }),
    });
    expect(result).toEqual(mockChannel);
  });

  it("throws ForbiddenError when creating without organization context", async () => {
    await expect(
      service.createNotificationChannel({
        input: {
          organizationId: "org-1",
          name: "Alerts",
          type: NotificationType.EMAIL,
          config: JSON.stringify({ emails: ["alerts@example.com"] }),
        },
        ctx: {} as any,
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ForbiddenError when creating with mismatched organization", async () => {
    await expect(
      service.createNotificationChannel({
        input: {
          organizationId: "org-2",
          name: "Alerts",
          type: NotificationType.EMAIL,
          config: JSON.stringify({ emails: ["alerts@example.com"] }),
        },
        ctx: baseCtx,
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws when creating with invalid JSON config", async () => {
    await expect(
      service.createNotificationChannel({
        input: {
          organizationId: "org-1",
          name: "Alerts",
          type: NotificationType.EMAIL,
          config: "{invalid-json}",
        },
        ctx: baseCtx,
      }),
    ).rejects.toThrow("Invalid configuration JSON");
  });

  it("updates an existing notification channel", async () => {
    const existingChannel = {
      id: "channel-1",
      organizationId: "org-1",
      name: "Primary alerts",
      type: NotificationType.EMAIL,
      config: JSON.stringify({ emails: ["alerts@example.com"] }),
    };

    const updatedChannel = {
      ...existingChannel,
      name: "Updated alerts",
    };

    mockRepository.findById
      .mockResolvedValueOnce(existingChannel)
      .mockResolvedValueOnce(updatedChannel);
    mockRepository.update.mockResolvedValue({ count: 1 });

    const result = await service.updateNotificationChannel({
      input: {
        id: "channel-1",
        organizationId: "org-1",
        name: "Updated alerts",
        config: JSON.stringify({ emails: ["alerts@example.com", "ops@example.com"] }),
        isActive: true,
      },
      ctx: baseCtx,
    });

    expect(mockRepository.update).toHaveBeenCalledWith(
      "channel-1",
      "org-1",
      expect.objectContaining({
        name: "Updated alerts",
        config: JSON.stringify({
          emails: ["alerts@example.com", "ops@example.com"],
        }),
        isActive: true,
      }),
    );
    expect(result).toEqual(updatedChannel);
  });

  it("throws NotFoundError when updating a non-existent channel", async () => {
    mockRepository.findById.mockResolvedValueOnce(null);

    await expect(
      service.updateNotificationChannel({
        input: {
          id: "missing",
          organizationId: "org-1",
          name: "Does not exist",
        },
        ctx: baseCtx,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws when updating with invalid JSON config", async () => {
    mockRepository.findById.mockResolvedValueOnce({
      id: "channel-1",
      organizationId: "org-1",
    });

    await expect(
      service.updateNotificationChannel({
        input: {
          id: "channel-1",
          organizationId: "org-1",
          config: "{invalid-json}",
        },
        ctx: baseCtx,
      }),
    ).rejects.toThrow("Invalid configuration JSON");
  });

  it("deletes a notification channel", async () => {
    mockRepository.findById.mockResolvedValueOnce({
      id: "channel-1",
      organizationId: "org-1",
    });
    mockRepository.delete.mockResolvedValue({ count: 1 });

    const result = await service.deleteNotificationChannel({
      input: {
        id: "channel-1",
        organizationId: "org-1",
      },
      ctx: baseCtx,
    });

    expect(mockRepository.delete).toHaveBeenCalledWith("channel-1", "org-1");
    expect(result).toEqual({ success: true });
  });

  it("throws NotFoundError when deleting a non-existent channel", async () => {
    mockRepository.findById.mockResolvedValueOnce(null);

    await expect(
      service.deleteNotificationChannel({
        input: {
          id: "missing",
          organizationId: "org-1",
        },
        ctx: baseCtx,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("returns notification channels for an organization", async () => {
    const channels = [
      { id: "channel-1", organizationId: "org-1", name: "Email" },
      { id: "channel-2", organizationId: "org-1", name: "Slack" },
    ];

    mockRepository.findByOrganizationId.mockResolvedValue(channels);

    const result = await service.getNotificationChannels({
      input: { organizationId: "org-1" },
      ctx: baseCtx,
    });

    expect(mockRepository.findByOrganizationId).toHaveBeenCalledWith("org-1");
    expect(result).toEqual(channels);
  });

  it("returns a single notification channel", async () => {
    const channel = {
      id: "channel-1",
      organizationId: "org-1",
      name: "Email",
    };

    mockRepository.findById.mockResolvedValue(channel);

    const result = await service.getNotificationChannel({
      input: { id: "channel-1", organizationId: "org-1" },
      ctx: baseCtx,
    });

    expect(mockRepository.findById).toHaveBeenCalledWith("channel-1", "org-1");
    expect(result).toEqual(channel);
  });

  it("throws NotFoundError when channel is not found", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      service.getNotificationChannel({
        input: { id: "missing", organizationId: "org-1" },
        ctx: baseCtx,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("returns zero counts when no active channels are configured", async () => {
    mockRepository.findActiveByOrganizationId.mockResolvedValue([]);

    const result = await service.sendNotifications("org-1", alertData);

    expect(mockRepository.findActiveByOrganizationId).toHaveBeenCalledWith(
      "org-1",
    );
    expect(result).toEqual({
      total: 0,
      success: 0,
      failed: 0,
    });
  });

  it("sends notifications across channels and aggregates results", async () => {
    const emailConfig = JSON.stringify({
      emails: ["alerts@example.com"],
    });
    const slackConfig = JSON.stringify({
      webhookUrl: "https://hooks.slack.com/services/test-webhook",
    });

    mockRepository.findActiveByOrganizationId.mockResolvedValue([
      {
        id: "channel-email",
        organizationId: "org-1",
        name: "Email",
        type: NotificationType.EMAIL,
        config: emailConfig,
      },
      {
        id: "channel-slack",
        organizationId: "org-1",
        name: "Slack",
        type: NotificationType.SLACK,
        config: slackConfig,
      },
    ]);

    sendAlertEmailSpy.mockResolvedValueOnce(true);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const result = await service.sendNotifications("org-1", alertData);

    expect(sendAlertEmailSpy).toHaveBeenCalledWith({
      to: "alerts@example.com",
      ...alertData,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.slack.com/services/test-webhook",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result).toEqual({
      total: 2,
      success: 1,
      failed: 1,
    });
  });

  it("handles invalid channel configuration during notification sending", async () => {
    mockRepository.findActiveByOrganizationId.mockResolvedValue([
      {
        id: "channel-invalid",
        organizationId: "org-1",
        name: "Bad Config",
        type: NotificationType.EMAIL,
        config: "{invalid-json}",
      },
    ]);

    const result = await service.sendNotifications("org-1", alertData);

    expect(sendAlertEmailSpy).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      total: 1,
      success: 0,
      failed: 1,
    });
  });
});

