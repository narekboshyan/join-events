 
import fs from "fs";
import * as nodemailer from "nodemailer";
import path from "path";
import { EventInvitationPayload } from "./interfaces/send-mail-template-payload.interface";
import { templates } from "./template";

class EmailService {
  private _transporter: nodemailer.Transporter;

  private MAIL_FROM: string = `Join Events <${process.env.SMTP_USER!}>`;

  constructor() {
    // Fixed: createTransporter -> createTransport
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private _loadTemplate(templateName: string): string {
    const templatesDir = path.join(
      process.cwd(),
      "src/lib/services/email/templates"
    );
    const filePath = path.join(templatesDir, `${templateName}.html`);
    return fs.readFileSync(filePath, "utf-8");
  }

  private async _sendTemplate({
    to,
    subject,
    template,
    context = {},
  }: {
    to: string;
    subject: string;
    template: string;
    context?: Record<string, any>;
  }): Promise<void> {
    const html = this._renderTemplate(template, context);

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.MAIL_FROM,
      to: to,
      subject,
      html,
    };

    await this._transporter.sendMail(mailOptions).then(() => {
      console.log(`Email sent to ${to}`);
    });
  }

  private _renderTemplate(
    template: string,
    context: Record<string, any>
  ): string {
    let html = this._loadTemplate(template);

    // Handle Handlebars-like conditionals and loops for event invitations
    html = this._processHandlebarsConditionals(html, context);
    html = this._processHandlebarsLoops(html, context);

    // Replace simple variables
    Object.keys(context).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      const value = context[key];
      // Convert to string, handling null/undefined
      const stringValue =
        value !== null && value !== undefined ? value.toString() : "";
      html = html.replace(regex, stringValue);
    });

    return html;
  }

  private _processHandlebarsConditionals(
    html: string,
    context: Record<string, any> // Fixed: Changed from string | number to any
  ): string {
    // Handle {{#if variable}} ... {{/if}} blocks
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    html = html.replace(ifRegex, (match, variable, content) => {
      const value = context[variable];
      // Check if value is truthy (not null, undefined, false, 0, or empty string)
      return value ? content : "";
    });

    return html;
  }

  private _processHandlebarsLoops(
    html: string,
    context: Record<string, any> // Fixed: Changed from string | number to any
  ): string {
    // Handle {{#each array}} ... {{/each}} blocks
    const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
    html = html.replace(eachRegex, (match, arrayName, template) => {
      const array = context[arrayName];
      if (!Array.isArray(array)) return "";

      return array
        .map((item, index) => {
          let itemTemplate = template;

          // Replace {{@index}} with current index (1-based for display)
          itemTemplate = itemTemplate.replace(
            /{{@index}}/g,
            (index + 1).toString()
          );

          // Replace item properties
          Object.keys(item).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            const value = item[key];
            const stringValue =
              value !== null && value !== undefined ? value.toString() : "";
            itemTemplate = itemTemplate.replace(regex, stringValue);
          });

          return itemTemplate;
        })
        .join("");
    });

    return html;
  }

  async sendVerificationEmail(
    email: string,
    confirmationCode: number,
    firstName: string
  ) {
    return this._sendTemplate({
      to: email,
      subject: "Verify your email",
      template: templates.VERIFY_USER,
      context: {
        firstName,
        link: `${process.env.NEXT_PUBLIC_BASE_URL}/am/signin?code=${confirmationCode}`,
      },
    });
  }

  async sendForgotPasswordEmail(
    email: string,
    confirmationCode: number,
    firstName: string
  ) {
    return this._sendTemplate({
      to: email,
      subject: "Verify your email",
      template: templates.FORGOT_PASSWORD,
      context: {
        firstName,
        confirmationCode,
      },
    });
  }

  /**
   * Send event invitation email
   */
  async sendEventInvitation(payload: EventInvitationPayload): Promise<void> {
    const subject = `🎉 You're invited to ${payload.eventTitle}!`;

    return this._sendTemplate({
      to: payload.to,
      subject,
      template: templates.EVENT_INVITATION,
      context: {
        // Spread all payload properties as context
        ...payload,
        // Format the role for display
        invitationRole: this._formatRole(payload.invitationRole),
        // Ensure locations is available for the template
        locations: payload.locations || [],
      },
    });
  }

  /**
   * Format role for better display in email
   */
  private _formatRole(role: string): string {
    const roleMap: Record<string, string> = {
      admin: "Event Administrator",
      co_admin: "Co-Administrator",
      moderator: "Event Moderator",
      organizer: "Event Organizer",
      participant: "Participant",
      volunteer: "Volunteer",
      vip: "VIP Guest",
      speaker: "Speaker",
      sponsor: "Sponsor",
    };

    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  }
}

export const mailService = new EmailService();
