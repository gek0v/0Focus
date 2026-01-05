
import { TimeSegment, ScheduleConfig } from '../types';

export const calculateSchedule = (config: ScheduleConfig): TimeSegment[] => {
  const now = new Date();
  const [hours, minutes] = config.targetEndTime.split(':').map(Number);
  
  const endTime = new Date();
  endTime.setHours(hours, minutes, 0, 0);

  // If target time is earlier than now, assume it's for tomorrow
  if (endTime < now) {
    endTime.setDate(endTime.getDate() + 1);
  }

  const totalAvailableMinutes = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));
  const totalBreakMinutes = config.breakCount * config.breakDuration;
  const totalWorkMinutes = totalAvailableMinutes - totalBreakMinutes;

  if (totalWorkMinutes <= 0) {
    throw new Error("No space for work segments! Decrease breaks or extend end time.");
  }

  const workSegmentCount = config.breakCount + 1;
  const workSegmentDuration = Math.floor(totalWorkMinutes / workSegmentCount);
  
  // Distribute the remaining minutes (rounding errors) to the first work block
  const remainingMinutes = totalWorkMinutes % workSegmentCount;

  const segments: TimeSegment[] = [];
  let currentStartTime = new Date(now);

  for (let i = 0; i < workSegmentCount; i++) {
    // Add Work Segment
    const duration = workSegmentDuration + (i === 0 ? remainingMinutes : 0);
    const workEnd = new Date(currentStartTime.getTime() + duration * 60000);
    
    segments.push({
      id: `work-${i}`,
      type: 'work',
      startTime: new Date(currentStartTime),
      endTime: new Date(workEnd),
      durationMinutes: duration,
    });
    
    currentStartTime = new Date(workEnd);

    // Add Break Segment if not the last work block
    if (i < config.breakCount) {
      const breakEnd = new Date(currentStartTime.getTime() + config.breakDuration * 60000);
      segments.push({
        id: `break-${i}`,
        type: 'break',
        startTime: new Date(currentStartTime),
        endTime: new Date(breakEnd),
        durationMinutes: config.breakDuration,
      });
      currentStartTime = new Date(breakEnd);
    }
  }

  return segments;
};
