const NotificationService = require('../../src/services/notification.service');
const Notification = require('../../src/models/Notification');
const User = require('../../src/models/User');
const mongoose = require('mongoose');

describe('NotificationService', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({
      name: 'Alert User',
      email: 'alerts@vulntrack.local',
      passwordHash: 'dummy',
      role: 'ANALYST',
    });
  });

  it('creates in-app and email notification successfully via notify()', async () => {
    const notif = await NotificationService.notify({
      userId: user._id,
      type: 'ASSIGNED',
      message: 'You have been assigned to CVE-2021-44228',
      vulnerabilityId: new mongoose.Types.ObjectId(),
    });

    expect(notif).toBeDefined();
    expect(notif.user.toString()).toBe(user._id.toString());
    expect(notif.type).toBe('ASSIGNED');
    expect(notif.read).toBe(false);

    const found = await Notification.findById(notif._id);
    expect(found).toBeDefined();
  });

  it('handles notify() gracefully when no userId is passed', async () => {
    const res = await NotificationService.notify({
      userId: null,
      type: 'INFO',
      message: 'Test message',
    });
    expect(res).toBeNull();
  });

  it('gets test transporter properly in test environment', async () => {
    const transporter = await NotificationService.getTransporter();
    expect(transporter).toBeDefined();
    const mailResult = await transporter.sendMail({
      to: 'test@vulntrack.local',
      subject: 'Test Subject',
    });
    expect(mailResult.messageId).toBe('test-mock-id');
  });
});
