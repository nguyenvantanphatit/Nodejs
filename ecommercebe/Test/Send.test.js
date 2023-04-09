const nodemailer = require("nodemailer");
const MockTransport = require("nodemailer-mock-transport");

describe("sendEmail", () => {
  it("should send an email successfully", async () => {
    const transporter = nodemailer.createTransport(MockTransport());

    const message = {
      from: "phamhoailinh779@gmail.com",
      to: "nguyenvantanphat.it@gmail.com",
      subject: "Test email",
      text: "This is a test email",
    };

    const info = await transporter.sendMail(message);

    expect(info).toBeDefined();
    expect(info.envelope.from).toBe("phamhoailinh779@gmail.com");
    expect(info.envelope.to[0]).toBe("nguyenvantanphat.it@gmail.com");
    expect(info.messageId).toBeDefined();
  });
});
