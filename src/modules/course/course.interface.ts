export interface ILesson {
  title: string;
  duration: string;

  level: string;
  videoUrl: string;
}

export interface ICourse {
  id: number;
  title: string;
  category: string;
  lessonCount: number;
  totalDuration: string;
  lessons: ILesson[];
  isLocked: boolean;
  price: number;
  currency: string;
  image: {
    url: string;
    public_id: string;
  };
  isAvailable: boolean;
  totalEnrolled: number;
}
