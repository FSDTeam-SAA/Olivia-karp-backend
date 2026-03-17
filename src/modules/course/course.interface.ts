export interface ILesson {
  title: string;
  duration: string;
  isLocked: boolean;
  level: string;
  videoUrl: string;
}

export interface ICourse {
  id: number;
  title: string;
  lessonsCount: number;
  totalDuration: string;
  lessons: ILesson[];
  isLocked: boolean;
  image: {
    url: string;
    public_id: string;
  };
}
