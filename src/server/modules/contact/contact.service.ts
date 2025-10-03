import { emailService } from "../shared/email.service";
import type { SendContactMessageInput } from "./contact.schema";

export class ContactService {
  async sendContactMessage(input: SendContactMessageInput): Promise<boolean> {
    return await emailService.sendContactEmail({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    });
  }
}

export const contactService = new ContactService();
