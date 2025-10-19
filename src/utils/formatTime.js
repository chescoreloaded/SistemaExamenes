/**
 * Formatear segundos a MM:SS
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatear segundos a texto legible
 */
export function formatTimeText(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins === 0) {
    return `${secs} segundo${secs !== 1 ? 's' : ''}`;
  }
  
  if (secs === 0) {
    return `${mins} minuto${mins !== 1 ? 's' : ''}`;
  }
  
  return `${mins}m ${secs}s`;
}