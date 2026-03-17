export interface ILesson {
  title: string;
  duration: string;
  isLocked: boolean;
  level: string;
}

export interface ICourse {
  id: number;
  title: string;
  lessonsCount: number;
  totalDuration: string;
  lessons: ILesson[];
  isLocked: boolean;
}
