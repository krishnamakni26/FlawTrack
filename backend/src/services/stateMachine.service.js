const { VULN_STATUSES, ROLES, AUDIT_ACTIONS } = require('../config/constants');
const AuditService = require('./audit.service');

const TRANSITION_RULES = Object.freeze({
  [VULN_STATUSES.SUBMITTED]: {
    [VULN_STATUSES.UNDER_VALIDATION]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.UNDER_VALIDATION]: {
    [VULN_STATUSES.NEEDS_INFO]: [ROLES.ANALYST, ROLES.ADMIN],
    [VULN_STATUSES.REJECTED]: [ROLES.ANALYST, ROLES.ADMIN],
    [VULN_STATUSES.VALIDATED]: [ROLES.ANALYST, ROLES.ADMIN],
    [VULN_STATUSES.DUPLICATE]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.NEEDS_INFO]: {
    [VULN_STATUSES.UNDER_VALIDATION]: [ROLES.REPORTER, ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.VALIDATED]: {
    [VULN_STATUSES.PRIORITIZED]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.PRIORITIZED]: {
    [VULN_STATUSES.OPEN]: [ROLES.ANALYST, ROLES.ADMIN],
    [VULN_STATUSES.ASSIGNED]: [ROLES.ANALYST, ROLES.ADMIN], // Shortcut if assignee provided
  },
  [VULN_STATUSES.OPEN]: {
    [VULN_STATUSES.ASSIGNED]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.ASSIGNED]: {
    [VULN_STATUSES.IN_PROGRESS]: [ROLES.ANALYST, ROLES.ADMIN],
    [VULN_STATUSES.ASSIGNED]: [ROLES.ANALYST, ROLES.ADMIN], // Re-assignment
  },
  [VULN_STATUSES.IN_PROGRESS]: {
    [VULN_STATUSES.RESOLVED]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.RESOLVED]: {
    [VULN_STATUSES.RETEST]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.RETEST]: {
    [VULN_STATUSES.VERIFIED]: [ROLES.ANALYST, ROLES.ADMIN],
    [VULN_STATUSES.REOPENED]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.VERIFIED]: {
    [VULN_STATUSES.CLOSED]: [ROLES.ANALYST, ROLES.ADMIN],
  },
  [VULN_STATUSES.REOPENED]: {
    [VULN_STATUSES.ASSIGNED]: [ROLES.ANALYST, ROLES.ADMIN],
    [VULN_STATUSES.IN_PROGRESS]: [ROLES.ANALYST, ROLES.ADMIN],
  },
});

class StateMachineService {
  /**
   * Check if transition is legally permitted for given role
   */
  static canTransition(currentStatus, targetStatus, userRole) {
    if (!currentStatus || !targetStatus) return false;
    const allowedTargets = TRANSITION_RULES[currentStatus];
    if (!allowedTargets) return false;

    const allowedRoles = allowedTargets[targetStatus];
    if (!allowedRoles) return false;

    return allowedRoles.includes(userRole);
  }

  /**
   * Transition vulnerability status with strict verification and audit logging
   */
  static async transition(vulnerability, targetStatus, user, notes = '', req = null) {
    const currentStatus = vulnerability.status;

    if (currentStatus === targetStatus) {
      return vulnerability; // Idempotent no-op
    }

    if (!StateMachineService.canTransition(currentStatus, targetStatus, user.role)) {
      const err = new Error(
        `Invalid status transition: Cannot transition from '${currentStatus}' to '${targetStatus}' by role '${user.role}'`
      );
      err.statusCode = 409;
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    // Apply special state transitions side-effects
    const beforeStatus = vulnerability.status;
    vulnerability.status = targetStatus;

    if (targetStatus === VULN_STATUSES.RESOLVED) {
      vulnerability.resolvedAt = new Date();
    } else if (targetStatus === VULN_STATUSES.CLOSED) {
      vulnerability.closedAt = new Date();
    } else if (targetStatus === VULN_STATUSES.REOPENED) {
      vulnerability.reopenCount = (vulnerability.reopenCount || 0) + 1;
    }

    await vulnerability.save();

    await AuditService.log({
      actor: user._id,
      actorRole: user.role,
      action: AUDIT_ACTIONS.STATUS_CHANGED,
      entityType: 'Vulnerability',
      entityId: vulnerability._id,
      before: { status: beforeStatus },
      after: { status: targetStatus, notes },
      req,
    });

    return vulnerability;
  }
}

module.exports = {
  StateMachineService,
  TRANSITION_RULES,
};
