export interface ILesson {
  title: string;
  duration: string;
  level: string;
  videoUrl: string;
}

export interface ICourse {
  title: string;
  category: string;
  picture?: string;
  description?: string;
  level: string;
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