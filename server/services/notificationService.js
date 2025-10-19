// Lightweight fallback NotificationService
// If the project has a dedicated notification service, replace this file or
// implement its methods accordingly. This fallback avoids crashes and logs actions.

async function notify(userId, payload) {
  try {
    console.log('[NotificationService] notify ->', { userId, payload });
    // No-op: adapt to your real notification sender (push/email/in-app) as needed
    return Promise.resolve(true);
  } catch (err) {
    console.error('[NotificationService] notify error', err);
    return Promise.resolve(false);
  }
}

async function broadcastTournament(tournamentId, payload) {
  try {
    console.log('[NotificationService] broadcastTournament ->', { tournamentId, payload });
    return Promise.resolve(true);
  } catch (err) {
    console.error('[NotificationService] broadcastTournament error', err);
    return Promise.resolve(false);
  }
}

module.exports = { notify, broadcastTournament };
