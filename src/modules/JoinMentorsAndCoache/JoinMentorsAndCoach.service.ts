import { IJoinMentorsAndCoach } from "./JoinMentorsAndCoach.interface";

const createJoinMentorsAndCoachIntoDB = async (
  file: Express.Multer.File,
  payload: IJoinMentorsAndCoach,
) => {};

const JoinMentorsAndCoachService = {
  createJoinMentorsAndCoachIntoDB,
};

export default JoinMentorsAndCoachService;
