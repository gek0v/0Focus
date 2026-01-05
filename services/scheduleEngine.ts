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

  const segments: TimeSegment[] = [];
  let currentStartTime = new Date(now);

  if (config.pomodoroMode) {
    const workDuration = 25;
    const breakDuration = 5;
    let i = 0;
    
    // Safety break to prevent infinite loops in edge cases
    const MAX_LOOPS = 100;
    let loopCount = 0;

    while (currentStartTime < endTime && loopCount < MAX_LOOPS) {
      loopCount++;
      
      // Calculate remaining minutes
      const remainingTotalMins = (endTime.getTime() - currentStartTime.getTime()) / 60000;
      
      // If less than 1 minute remains, stop to avoid 0-length segments or infinite loops
      if (remainingTotalMins < 1) break;

      // Work Segment Logic
      let actualWorkDuration = workDuration;
      
      // If full work duration exceeds end time, truncate
      if (remainingTotalMins < workDuration) {
         actualWorkDuration = Math.floor(remainingTotalMins);
      }
      
      // If truncated work duration is 0 (should be caught by <1 check, but safe guard), break
      if (actualWorkDuration <= 0) break;

      const workEnd = new Date(currentStartTime.getTime() + actualWorkDuration * 60000);
      
      segments.push({
        id: `work-${i}`,
        type: 'work',
        startTime: new Date(currentStartTime),
        endTime: new Date(workEnd),
        durationMinutes: actualWorkDuration,
      });

      currentStartTime = workEnd;
      
      // Check if we reached end time or have very little time left
      const remainingAfterWork = (endTime.getTime() - currentStartTime.getTime()) / 60000;
      if (remainingAfterWork < 1) break;

      // Break Segment Logic
      let actualBreakDuration = breakDuration;
      
      if (remainingAfterWork < breakDuration) {
         actualBreakDuration = Math.floor(remainingAfterWork);
      }

      if (actualBreakDuration > 0) {
         const breakEnd = new Date(currentStartTime.getTime() + actualBreakDuration * 60000);
         segments.push({
            id: `break-${i}`,
            type: 'break',
            startTime: new Date(currentStartTime),
            endTime: new Date(breakEnd),
            durationMinutes: actualBreakDuration,
         });
         currentStartTime = breakEnd;
      }

      i++;
    }

  } else {
    // Standard "Fit to time" Logic
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
  }

  return segments;
};
