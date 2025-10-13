import { describe, it, expect, beforeEach, vi } from "vitest";
import { AlertService } from "../alert.service";
import {
  AlertCondition,
  CheckStatus,
  PlanType,
} from "../../../../generated/prisma";
import {
  NotFoundError,
  ForbiddenError,
  TooManyRequestsError,
} from "../../../errors/custom-errors";

// Mock repositories and services
const mockAlertRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByApiEndpoint: vi.fn(),
  findActiveByApiEndpoint: vi.fn(),
  findByOrganization: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  createTrigger: vi.fn(),
  findTriggersByAlert: vi.fn(),
  createNotification: vi.fn(),
  deleteNotification: vi.fn(),
  updateLastTriggered: vi.fn(),
};

const mockApiEndpointRepository = {
  findById: vi.fn(),
  findByIdInternal: vi.fn(),
  findByUserId: vi.fn(),
  findByOrganizationId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findActive: vi.fn(),
  findMany: vi.fn(),
};

const mockMonitoringRepository = {
  getUptimeStats: vi.fn(),
  getOverallStats: vi.fn(),
  createMonitoringCheck: vi.fn(),
  findChecksByApiEndpointId: vi.fn(),
  getAverageResponseTime: vi.fn(),
  getResponseTimeHistory: vi.fn(),
  findUserById: vi.fn(),
  getTopEndpoints: vi.fn(),
  getUptimeHistory: vi.fn(),
  getResponseTimeHistoryByUser: vi.fn(),
  findRecentFailuresByOrganization: vi.fn(),
};

const mockNotificationChannelService = {
  sendNotifications: vi
    .fn()
    .mockResolvedValue({ total: 0, success: 0, failed: 0 }),
  createNotificationChannel: vi.fn(),
  updateNotificationChannel: vi.fn(),
  deleteNotificationChannel: vi.fn(),
  getNotificationChannels: vi.fn(),
  getNotificationChannel: vi.fn(),
};

const TEST_CTX = {
  user: { id: "user-1", email: "user@example.com", role: "USER" as const },
  organizationId: "org-1",
  organizationPlan: PlanType.FREE,
} as const;

describe("AlertService", () => {
  let service: AlertService;

  beforeEach(() => {
    service = new AlertService(
      mockAlertRepository as any,
      mockApiEndpointRepository as any,
      mockMonitoringRepository as any,
      mockNotificationChannelService as any,
    );
    vi.clearAllMocks();
  });

  describe("createAlert", () => {
    it("should create alert successfully", async () => {
      const mockEndpoint = {
        id: "endpoint-1",
        name: "Test API",
        url: "https://api.example.com",
        organizationId: "org-1",
      };

      const mockAlert = {
        id: "alert-1",
        name: "High Response Time",
        condition: AlertCondition.RESPONSE_TIME_ABOVE,
        threshold: 1000,
        apiEndpointId: "endpoint-1",
        userId: "user-1",
        isActive: true,
      };

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint);
      mockAlertRepository.findByOrganization.mockResolvedValue([]);
      mockAlertRepository.create.mockResolvedValue(mockAlert);

      const result = await service.createAlert({
        input: {
          name: "High Response Time",
          apiEndpointId: "endpoint-1",
          condition: AlertCondition.RESPONSE_TIME_ABOVE,
          threshold: 1000,
          isActive: true,
        },
        ctx: TEST_CTX,
      });

      expect(mockApiEndpointRepository.findById).toHaveBeenCalledWith(
        "endpoint-1",
        "org-1",
      );
      expect(mockAlertRepository.findByOrganization).toHaveBeenCalledWith(
        "org-1",
      );
      expect(mockAlertRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockAlert);
    });

    it("should throw ForbiddenError if endpoint not found", async () => {
      mockApiEndpointRepository.findById.mockResolvedValue(null);

      await expect(
        service.createAlert({
          input: {
            name: "Test Alert",
            apiEndpointId: "endpoint-1",
            condition: AlertCondition.RESPONSE_TIME_ABOVE,
            threshold: 1000,
            isActive: true,
          },
          ctx: TEST_CTX,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw TooManyRequestsError if plan limit reached", async () => {
      const mockEndpoint = {
        id: "endpoint-1",
        name: "Test API",
        url: "https://api.example.com",
        organizationId: "org-1",
      };

      // Mock 3 existing alerts for FREE plan (max is 3)
      const existingAlerts = Array(3).fill({ id: "alert-x" });

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint);
      mockAlertRepository.findByOrganization.mockResolvedValue(existingAlerts);

      await expect(
        service.createAlert({
          input: {
            name: "Test Alert",
            apiEndpointId: "endpoint-1",
            condition: AlertCondition.RESPONSE_TIME_ABOVE,
            threshold: 1000,
            isActive: true,
          },
          ctx: TEST_CTX,
        }),
      ).rejects.toThrow(TooManyRequestsError);
    });
  });

  describe("getAlert", () => {
    it("should get alert with organization access check", async () => {
      const mockAlert = {
        id: "alert-1",
        name: "Test Alert",
        apiEndpoint: {
          id: "endpoint-1",
          organizationId: "org-1",
        },
      };

      mockAlertRepository.findById.mockResolvedValue(mockAlert);

      const result = await service.getAlert({
        input: { id: "alert-1" },
        ctx: TEST_CTX,
      });

      expect(result).toEqual(mockAlert);
    });

    it("should throw NotFoundError if alert does not exist", async () => {
      mockAlertRepository.findById.mockResolvedValue(null);

      await expect(
        service.getAlert({
          input: { id: "alert-1" },
          ctx: TEST_CTX,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if organization mismatch", async () => {
      const mockAlert = {
        id: "alert-1",
        apiEndpoint: {
          organizationId: "org-2",
        },
      };

      mockAlertRepository.findById.mockResolvedValue(mockAlert);

      await expect(
        service.getAlert({
          input: { id: "alert-1" },
          ctx: TEST_CTX,
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("evaluateAlerts", () => {
    it("should not trigger alert if no active alerts exist", async () => {
      mockAlertRepository.findActiveByApiEndpoint.mockResolvedValue([]);

      await service.evaluateAlerts({
        apiEndpointId: "endpoint-1",
        status: CheckStatus.FAILURE,
        responseTime: 2000,
        statusCode: 500,
      });

      expect(mockNotificationChannelService.sendNotifications).not.toHaveBeenCalled();
    });

    it("should trigger alert for RESPONSE_TIME_ABOVE condition", async () => {
      const mockAlert = {
        id: "alert-1",
        name: "High Response Time",
        condition: AlertCondition.RESPONSE_TIME_ABOVE,
        threshold: 1000,
        userId: "user-1",
        notifications: [],
      };

      const mockEndpoint = {
        id: "endpoint-1",
        name: "Test API",
        url: "https://api.example.com",
        organizationId: "org-1",
      };

      mockAlertRepository.findActiveByApiEndpoint.mockResolvedValue([
        mockAlert,
      ]);
      mockApiEndpointRepository.findByIdInternal.mockResolvedValue(
        mockEndpoint,
      );
      mockAlertRepository.createTrigger.mockResolvedValue({});
      mockAlertRepository.updateLastTriggered.mockResolvedValue(undefined);

      await service.evaluateAlerts({
        apiEndpointId: "endpoint-1",
        status: CheckStatus.SUCCESS,
        responseTime: 2000, // Above threshold of 1000ms
        statusCode: 200,
      });

      expect(mockAlertRepository.createTrigger).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 2000,
        }),
      );
      expect(mockNotificationChannelService.sendNotifications).toHaveBeenCalledWith(
        "org-1",
        expect.objectContaining({
          alertName: "High Response Time",
          responseTime: 2000,
        }),
      );
    });

    it("should trigger alert for STATUS_CODE_NOT condition", async () => {
      const mockAlert = {
        id: "alert-1",
        name: "Status Code Alert",
        condition: AlertCondition.STATUS_CODE_NOT,
        threshold: 200, // Expected 200
        userId: "user-1",
        notifications: [],
      };

      const mockEndpoint = {
        id: "endpoint-1",
        name: "Test API",
        url: "https://api.example.com",
        organizationId: "org-1",
      };

      mockAlertRepository.findActiveByApiEndpoint.mockResolvedValue([
        mockAlert,
      ]);
      mockApiEndpointRepository.findByIdInternal.mockResolvedValue(
        mockEndpoint,
      );
      mockAlertRepository.createTrigger.mockResolvedValue({});
      mockAlertRepository.updateLastTriggered.mockResolvedValue(undefined);

      await service.evaluateAlerts({
        apiEndpointId: "endpoint-1",
        status: CheckStatus.FAILURE,
        responseTime: 500,
        statusCode: 500, // Not 200
      });

      expect(mockAlertRepository.createTrigger).toHaveBeenCalled();
      expect(mockNotificationChannelService.sendNotifications).toHaveBeenCalled();
    });

    it("should trigger alert for UPTIME_BELOW condition", async () => {
      const mockAlert = {
        id: "alert-1",
        name: "Low Uptime",
        condition: AlertCondition.UPTIME_BELOW,
        threshold: 95, // 95% uptime threshold
        userId: "user-1",
        notifications: [],
      };

      const mockEndpoint = {
        id: "endpoint-1",
        name: "Test API",
        url: "https://api.example.com",
        organizationId: "org-1",
      };

      mockAlertRepository.findActiveByApiEndpoint.mockResolvedValue([
        mockAlert,
      ]);
      mockApiEndpointRepository.findByIdInternal.mockResolvedValue(
        mockEndpoint,
      );
      mockMonitoringRepository.getUptimeStats.mockResolvedValue({
        uptimePercentage: 90, // Below 95%
        totalChecks: 100,
        successfulChecks: 90,
      });
      mockAlertRepository.createTrigger.mockResolvedValue({});
      mockAlertRepository.updateLastTriggered.mockResolvedValue(undefined);

      await service.evaluateAlerts({
        apiEndpointId: "endpoint-1",
        status: CheckStatus.FAILURE,
        responseTime: 500,
        statusCode: 500,
      });

      expect(mockMonitoringRepository.getUptimeStats).toHaveBeenCalled();
      expect(mockAlertRepository.createTrigger).toHaveBeenCalled();
      expect(mockNotificationChannelService.sendNotifications).toHaveBeenCalled();
    });

    it("should not trigger if response time is below threshold", async () => {
      const mockAlert = {
        id: "alert-1",
        name: "High Response Time",
        condition: AlertCondition.RESPONSE_TIME_ABOVE,
        threshold: 1000,
        userId: "user-1",
        notifications: [],
      };

      mockAlertRepository.findActiveByApiEndpoint.mockResolvedValue([
        mockAlert,
      ]);

      await service.evaluateAlerts({
        apiEndpointId: "endpoint-1",
        status: CheckStatus.SUCCESS,
        responseTime: 500, // Below threshold
        statusCode: 200,
      });

      expect(mockAlertRepository.createTrigger).not.toHaveBeenCalled();
      expect(mockNotificationChannelService.sendNotifications).not.toHaveBeenCalled();
    });

    it("should throttle repeated alerts for same alert", async () => {
      const mockAlert = {
        id: "alert-1",
        name: "High Response Time",
        condition: AlertCondition.RESPONSE_TIME_ABOVE,
        threshold: 1000,
        userId: "user-1",
        notifications: [],
      };

      const mockEndpoint = {
        id: "endpoint-1",
        name: "Test API",
        url: "https://api.example.com",
        organizationId: "org-1",
      };

      mockAlertRepository.findActiveByApiEndpoint.mockResolvedValue([
        mockAlert,
      ]);
      mockApiEndpointRepository.findByIdInternal.mockResolvedValue(
        mockEndpoint,
      );
      mockAlertRepository.createTrigger.mockResolvedValue({});
      mockAlertRepository.updateLastTriggered.mockResolvedValue(undefined);

      // First alert should trigger
      await service.evaluateAlerts({
        apiEndpointId: "endpoint-1",
        status: CheckStatus.SUCCESS,
        responseTime: 2000,
        statusCode: 200,
      });

      expect(mockNotificationChannelService.sendNotifications).toHaveBeenCalledTimes(
        1,
      );

      // Second alert immediately after should be throttled
      await service.evaluateAlerts({
        apiEndpointId: "endpoint-1",
        status: CheckStatus.SUCCESS,
        responseTime: 2000,
        statusCode: 200,
      });

      // Still only called once due to throttling
      expect(mockNotificationChannelService.sendNotifications).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe("deleteAlert", () => {
    it("should delete alert after access check", async () => {
      const mockAlert = {
        id: "alert-1",
        apiEndpoint: {
          organizationId: "org-1",
        },
      };

      mockAlertRepository.findById.mockResolvedValue(mockAlert);
      mockAlertRepository.delete.mockResolvedValue(mockAlert);

      await service.deleteAlert({
        input: { id: "alert-1" },
        ctx: TEST_CTX,
      });

      expect(mockAlertRepository.delete).toHaveBeenCalledWith("alert-1");
    });
  });

  describe("updateAlert", () => {
    it("should update alert after access check", async () => {
      const mockAlert = {
        id: "alert-1",
        name: "Old Name",
        apiEndpoint: {
          organizationId: "org-1",
        },
      };

      const updatedAlert = {
        ...mockAlert,
        name: "New Name",
      };

      mockAlertRepository.findById.mockResolvedValue(mockAlert);
      mockAlertRepository.update.mockResolvedValue(updatedAlert);

      const result = await service.updateAlert({
        input: { id: "alert-1", name: "New Name" },
        ctx: TEST_CTX,
      });

      expect(mockAlertRepository.update).toHaveBeenCalledWith("alert-1", {
        name: "New Name",
      });
      expect(result).toEqual(updatedAlert);
    });
  });

  describe("getAlertsByEndpoint", () => {
    it("should get alerts for endpoint after access check", async () => {
      const mockEndpoint = {
        id: "endpoint-1",
        organizationId: "org-1",
      };

      const mockAlerts = [
        {
          id: "alert-1",
          name: "Alert 1",
          apiEndpointId: "endpoint-1",
        },
        {
          id: "alert-2",
          name: "Alert 2",
          apiEndpointId: "endpoint-1",
        },
      ];

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint);
      mockAlertRepository.findByApiEndpoint.mockResolvedValue(mockAlerts);

      const result = await service.getAlertsByEndpoint({
        input: { apiEndpointId: "endpoint-1" },
        ctx: TEST_CTX,
      });

      expect(result).toEqual(mockAlerts);
    });

    it("should throw ForbiddenError if endpoint access denied", async () => {
      mockApiEndpointRepository.findById.mockResolvedValue(null);

      await expect(
        service.getAlertsByEndpoint({
          input: { apiEndpointId: "endpoint-1" },
          ctx: TEST_CTX,
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
