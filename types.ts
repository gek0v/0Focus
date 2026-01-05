
export type SegmentType = 'work' | 'break';

export interface TimeSegment {
  id: string;
  type: SegmentType;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface ScheduleConfig {
  targetEndTime: string;
  breakCount: number;
  breakDuration: number;
}
