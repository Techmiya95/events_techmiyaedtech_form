export const generateRegistrationID = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `EVT-2026-${randomPart}`;
};
