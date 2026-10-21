const { StateMachineService } = require('../../src/services/stateMachine.service');
const { VULN_STATUSES, ROLES } = require('../../src/config/constants');

describe('Vulnerability State Machine Service', () => {
  describe('Permitted Legal Transitions', () => {
    test('permits ANALYST and ADMIN to start validation from SUBMITTED', () => {
      expect(
        StateMachineService.canTransition(VULN_STATUSES.SUBMITTED, VULN_STATUSES.UNDER_VALIDATION, ROLES.ANALYST)
      ).toBe(true);
      expect(
        StateMachineService.canTransition(VULN_STATUSES.SUBMITTED, VULN_STATUSES.UNDER_VALIDATION, ROLES.ADMIN)
      ).toBe(true);
    });

    test('permits complete happy-path lifecycle progression', () => {
      const transitions = [
        [VULN_STATUSES.SUBMITTED, VULN_STATUSES.UNDER_VALIDATION],
        [VULN_STATUSES.UNDER_VALIDATION, VULN_STATUSES.VALIDATED],
        [VULN_STATUSES.VALIDATED, VULN_STATUSES.PRIORITIZED],
        [VULN_STATUSES.PRIORITIZED, VULN_STATUSES.OPEN],
        [VULN_STATUSES.OPEN, VULN_STATUSES.ASSIGNED],
        [VULN_STATUSES.ASSIGNED, VULN_STATUSES.IN_PROGRESS],
        [VULN_STATUSES.IN_PROGRESS, VULN_STATUSES.RESOLVED],
        [VULN_STATUSES.RESOLVED, VULN_STATUSES.RETEST],
        [VULN_STATUSES.RETEST, VULN_STATUSES.VERIFIED],
        [VULN_STATUSES.VERIFIED, VULN_STATUSES.CLOSED],
      ];

      for (const [from, to] of transitions) {
        expect(StateMachineService.canTransition(from, to, ROLES.ANALYST)).toBe(true);
      }
    });

    test('permits re-test failure leading to REOPENED then ASSIGNED', () => {
      expect(
        StateMachineService.canTransition(VULN_STATUSES.RETEST, VULN_STATUSES.REOPENED, ROLES.ANALYST)
      ).toBe(true);
      expect(
        StateMachineService.canTransition(VULN_STATUSES.REOPENED, VULN_STATUSES.ASSIGNED, ROLES.ANALYST)
      ).toBe(true);
    });

    test('permits REPORTER to transition NEEDS_INFO back to UNDER_VALIDATION', () => {
      expect(
        StateMachineService.canTransition(VULN_STATUSES.NEEDS_INFO, VULN_STATUSES.UNDER_VALIDATION, ROLES.REPORTER)
      ).toBe(true);
    });
  });

  describe('Illegal Transitions & Role Restrictions', () => {
    test('prohibits illegal transition jumps (e.g. SUBMITTED directly to CLOSED)', () => {
      expect(
        StateMachineService.canTransition(VULN_STATUSES.SUBMITTED, VULN_STATUSES.CLOSED, ROLES.ADMIN)
      ).toBe(false);
    });

    test('prohibits REPORTER from validating or closing reports', () => {
      expect(
        StateMachineService.canTransition(VULN_STATUSES.UNDER_VALIDATION, VULN_STATUSES.VALIDATED, ROLES.REPORTER)
      ).toBe(false);
      expect(
        StateMachineService.canTransition(VULN_STATUSES.VERIFIED, VULN_STATUSES.CLOSED, ROLES.REPORTER)
      ).toBe(false);
    });

    test('throws HTTP 409 Conflict when transition is attempted illegally and writes no change', async () => {
      const mockVuln = {
        status: VULN_STATUSES.SUBMITTED,
        save: jest.fn(),
      };
      const analystUser = { _id: '123', role: ROLES.ANALYST };

      try {
        await StateMachineService.transition(mockVuln, VULN_STATUSES.CLOSED, analystUser);
        throw new Error('Should have thrown 409 error');
      } catch (err) {
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('INVALID_STATUS_TRANSITION');
        expect(mockVuln.save).not.toHaveBeenCalled();
        expect(mockVuln.status).toBe(VULN_STATUSES.SUBMITTED);
      }
    });
  });
});
