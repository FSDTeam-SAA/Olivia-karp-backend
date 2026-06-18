import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { User } from '../user/user.model';
import { IJoinMentorsAndCoach } from './JoinMentorsAndCoach.interface';
import JoinMentorCoach from './JoinMentorsAndCoach.model';
import fs from 'fs';
// import { parseCSV } from '../../utils/csvParser';

const createJoinMentorsAndCoachIntoDB = async (
  file: Express.Multer.File,
  payload: IJoinMentorsAndCoach,
  email: string,
) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No account found with the provided credentials.', StatusCodes.NOT_FOUND);
  }

  const existingUser = await JoinMentorCoach.findOne({
    userId: user._id,
    isApproved: true,
  });
  if (existingUser && user.role !== 'admin') {
    throw new AppError(`You are already join as a ${existingUser.type}`, StatusCodes.BAD_REQUEST);
  }

  const existingEmail = await JoinMentorCoach.findOne({
    userId: user._id,
    isApproved: false,
  });
  if (existingEmail && user.role !== 'admin') {
    throw new AppError(
      `You have already applied as a ${existingEmail.type}, please wait for admin approval`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const emailExists = await JoinMentorCoach.findOne({ email: payload.email });
  if (emailExists) {
    throw new AppError('This email already exists', StatusCodes.BAD_REQUEST);
  }

  if (file) {
    const imageData = await uploadToCloudinary(file.path, 'mentors-coaches');

    payload.image = {
      url: imageData.secure_url,
      public_id: imageData.public_id,
    };
  } else {
    throw new AppError('Image is required', StatusCodes.BAD_REQUEST);
  }

  const result = await JoinMentorCoach.create({
    ...payload,
    userId: user._id,
    isApproved: user.role === 'admin' ? true : false,
  });

  return result;
};

const getAllJoinMentorsAndCoaches = async (query: any) => {
  const { searchTerm, type, page = 1, limit = 10 } = query;

  const filter: any = {};

  // filter mentor / coach
  if (type) {
    filter.type = type;
  }

  // search
  if (searchTerm) {
    filter.$or = [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { skills: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const result = await JoinMentorCoach.find(filter)
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  const total = await JoinMentorCoach.countDocuments(filter);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data: result,
  };
};

const getApprovedJoinMentorsAndCoaches = async (query: any) => {
  const { searchTerm, type, page = 1, limit = 10 } = query;

  const filter: any = { isApproved: true, isActive: true };

  // filter mentor / coach
  if (type) {
    filter.type = type;
  }

  // search
  if (searchTerm) {
    filter.$or = [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { skills: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const result = await JoinMentorCoach.find(filter)
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  const total = await JoinMentorCoach.countDocuments(filter);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data: result,
  };
};

const getSingleJoinMentorsAndCoach = async (id: string) => {
  const result = await JoinMentorCoach.findById(id);
  if (!result) {
    throw new AppError('Join mentors and coaches not found', StatusCodes.NOT_FOUND);
  }

  return result;
};

const approvedJoinMentorsAndCoach = async (id: string) => {
  const result = await JoinMentorCoach.findById(id);
  if (!result) {
    throw new AppError('Join mentors and coaches not found', StatusCodes.NOT_FOUND);
  }

  await JoinMentorCoach.findByIdAndUpdate({ _id: id }, { isApproved: true }, { new: true });
};

const toggleMentorAndCoachActive = async (id: string) => {
  const result = await JoinMentorCoach.findById(id);
  if (!result) {
    throw new AppError('Join mentors and coaches not found', StatusCodes.NOT_FOUND);
  }

  await JoinMentorCoach.findByIdAndUpdate(
    { _id: id },
    { isActive: !result.isActive },
    { new: true },
  );
};

// ---------------------------------------------------------------------------
// Minimal RFC-4180-compliant CSV parser (handles quoted fields with commas
// and embedded newlines, which Airtable exports heavily use).
// ---------------------------------------------------------------------------
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped quote inside a quoted field
        field += '"';
        i += 2;
        continue;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        field += ch;
        i++;
        continue;
      }
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r' && next === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 2;
      continue;
    }

    if (ch === '\n' || ch === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Push last field / row
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Normalize a header string to a compact lowercase key for fuzzy matching.
// ---------------------------------------------------------------------------
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ---------------------------------------------------------------------------
// Split a full name into { firstName, lastName }.
// Everything before the last whitespace-separated token is firstName;
// the last token is lastName.  If there is only one word it becomes
// firstName and lastName is set to an empty string.
// ---------------------------------------------------------------------------
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const lastName = parts.pop()!;
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

// ---------------------------------------------------------------------------
// Map of normalised header key → internal field name.
//
// This table covers BOTH the old camelCase headers (in case someone uploads
// a previously-exported CSV) AND the verbose Airtable / form-style headers
// that the current CSV uses.
// ---------------------------------------------------------------------------
const HEADER_MAP: Record<string, string> = {
  // ── Full name (Airtable export style) ──────────────────────────────────
  fullname: 'fullName',
  name: 'fullName',

  // ── Separate first / last (legacy uploads) ─────────────────────────────
  firstname: 'firstName',
  lastname: 'lastName',

  // ── Contact ────────────────────────────────────────────────────────────
  email: 'email',
  whatisyouremail: 'email',
  whatsyouremail: 'email',

  phone: 'phone',
  address: 'address',

  // ── Profile image ──────────────────────────────────────────────────────
  headshot: 'imageUrl',
  image: 'imageUrl',
  imageurl: 'imageUrl',
  photo: 'imageUrl',
  profilepicture: 'imageUrl',

  // ── Type (mentor / coach) ──────────────────────────────────────────────
  type: 'type',
  role: 'type',
  supportstyle: 'type', // "Mentor" or "Coach" in Airtable
  areyouamentororacoach: 'type',

  // ── Skills / focus areas ───────────────────────────────────────────────
  skills: 'skills',
  whataresome: 'skills', // partial match – extended below
  'whataresome ofyourtopskills': 'skills',
  whatareyourtopskills: 'skills',
  expertfocus: 'skills',
  topskills: 'skills',
  areasofexpertise: 'skills',

  // ── Languages ──────────────────────────────────────────────────────────
  languages: 'languages',
  languagesyouspeak: 'languages',
  languageyouspeak: 'languages',
  whatisyourlanguage: 'languages',

  // ── Bio / About ────────────────────────────────────────────────────────
  bio: 'bio',
  about: 'about',
  wheredoesyourexpertisecomefrm: 'about',
  wheredoesyourexpertisecomefrom: 'about',
  expertise: 'about',

  // ── Who should book / motivation ───────────────────────────────────────
  whoshouldbook: 'motivation',
  whoshouldbooked: 'motivation',
  whoshouldbooka: 'motivation',
  motivation: 'motivation',
  goal: 'goal',

  // ── Experience ─────────────────────────────────────────────────────────
  experienceyears: 'experienceYears',
  yearsofexperience: 'experienceYears',
  experience: 'experience',

  // ── Designation ────────────────────────────────────────────────────────
  designation: 'designation',
  jobtitle: 'designation',
  title: 'designation',

  // ── Social / booking ───────────────────────────────────────────────────
  linkedin: 'linkedin',
  website: 'website',
  bookinglink: 'bookingLink',
  bookalink: 'bookingLink',
  bookaSessionLink: 'bookingLink',
  bookasessionlink: 'bookingLink',
  schedulinglink: 'bookingLink',

  // ── Paid session ───────────────────────────────────────────────────────
  ispaid: 'isPaidSession',
  'ispaid session': 'isPaidSession',
  ispaidsession: 'isPaidSession',
  doyoucharge: 'isPaidSession',
  doyouchargea: 'isPaidSession',
  doyouchargeafee: 'isPaidSession',
  doyouchargeafeeforyoursessions: 'isPaidSession',
  chargeafee: 'isPaidSession',
  paid: 'isPaidSession',

  // ── Hourly rate ────────────────────────────────────────────────────────
  hourlyrate: 'hourlyRate',
  rate: 'hourlyRate',
  pricerange: 'hourlyRate',
  whatisyourpricerange: 'hourlyRate',
  whatisyourpricerengeforyoursessions: 'hourlyRate',
  whatisyourpricerangeforyoursessions: 'hourlyRate',
  price: 'hourlyRate',
  priceranges: 'hourlyRate',

  // ── Contact method (used to derive bookingLink fallback) ───────────────
  bestwaytocntact: 'contactMethod',
  whatisthebestway: 'contactMethod',
  whatisthebestwaytocontact: 'contactMethod',
  contactmethod: 'contactMethod',

  // ── Support ────────────────────────────────────────────────────────────
  support: 'support',
};

// Extra fuzzy patterns for very long Airtable headers
const FUZZY_PATTERNS: Array<{ pattern: RegExp; field: string }> = [
  { pattern: /top\s*skill/i, field: 'skills' },
  { pattern: /expert\s*focus/i, field: 'skills' },
  { pattern: /language/i, field: 'languages' },
  { pattern: /expertise\s*come\s*from/i, field: 'about' },
  { pattern: /book\s*a\s*session/i, field: 'bookingLink' },
  { pattern: /book.*call.*with\s*me/i, field: 'motivation' },
  { pattern: /who\s*should\s*book/i, field: 'motivation' },
  { pattern: /charge.*fee/i, field: 'isPaidSession' },
  { pattern: /price\s*rang/i, field: 'hourlyRate' },
  { pattern: /support\s*style/i, field: 'type' },
  { pattern: /best\s*way.*contact/i, field: 'contactMethod' },
  { pattern: /^headshot$/i, field: 'imageUrl' },
  { pattern: /full\s*name/i, field: 'fullName' },
  { pattern: /^email/i, field: 'email' },
];

function resolveHeader(raw: string): string {
  const trimmed = raw.trim();
  const nk = normalizeKey(trimmed);

  // 1. Exact normalised match
  if (HEADER_MAP[nk]) return HEADER_MAP[nk];

  // 2. Fuzzy regex match
  for (const { pattern, field } of FUZZY_PATTERNS) {
    if (pattern.test(trimmed)) return field;
  }

  // 3. Return the original (trimmed) header as fallback
  return trimmed;
}

// ---------------------------------------------------------------------------
// Extract a URL from a cell that may look like:
//   "filename.jpg (https://cdn.example.com/...)"
//   or just a plain URL
// ---------------------------------------------------------------------------
function extractUrl(cell: string): string {
  if (!cell) return '';
  const urlMatch = cell.match(/https?:\/\/[^\s)]+/);
  return urlMatch ? urlMatch[0] : cell.trim();
}

// ---------------------------------------------------------------------------
// Determine whether a row has enough non-empty columns to be a real data row
// (skips the lookup / metadata rows at the top of the Airtable export).
// We require at least 4 non-empty cells AND a non-empty first column (name).
// ---------------------------------------------------------------------------
function isDataRow(row: string[]): boolean {
  if (!row[0]?.trim()) return false;
  const nonEmpty = row.filter((c) => c.trim() !== '').length;
  return nonEmpty >= 4;
}

// ---------------------------------------------------------------------------
// Main service function
// ---------------------------------------------------------------------------
export const bulkUploadMentorsAndCoaches = async (file: Express.Multer.File) => {
  const rawCsvText = fs.readFileSync(file.path, 'utf-8');
  // Strip UTF-8 BOM if present
  const csvText = rawCsvText.replace(/^\uFEFF/, '');

  try {
    fs.unlinkSync(file.path);
  } catch (err) {
    console.error('Failed to delete temp file:', err);
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    throw new Error('CSV file is empty or missing data rows');
  }

  // ── Resolve headers ───────────────────────────────────────────────────
  const rawHeaders = rows[0];
  const headers = rawHeaders.map(resolveHeader);

  // ── Filter to real data rows only ────────────────────────────────────
  // Airtable often puts lookup values below the header (rows 2-N with only
  // the 3rd column filled, etc.).  We skip those.
  const dataRows = rows.slice(1).filter(isDataRow);

  if (dataRows.length === 0) {
    throw new Error('No valid data rows found in the CSV after filtering metadata rows');
  }

  const errors: string[] = [];
  let createdCount = 0;
  let updatedCount = 0;

  for (let idx = 0; idx < dataRows.length; idx++) {
    const row = dataRows[idx];
    // CSV row number in the original file (approximate; for error messages)
    const rowNum = idx + 2;

    // Map columns → rawData object
    const rawData: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      rawData[header] = row[colIdx] !== undefined ? row[colIdx].trim() : '';
    });

    try {
      // ── Resolve firstName / lastName ─────────────────────────────────
      let firstName = rawData['firstName'] || '';
      let lastName = rawData['lastName'] || '';

      if ((!firstName || !lastName) && rawData['fullName']) {
        const split = splitFullName(rawData['fullName']);
        if (!firstName) firstName = split.firstName;
        if (!lastName) lastName = split.lastName;
      }

      if (!firstName) {
        throw new Error(
          `Row ${rowNum}: Could not determine firstName (checked "firstName" and "fullName" columns)`,
        );
      }

      // ── Resolve type (mentor / coach) ────────────────────────────────
      // The Airtable "Support Style" column may contain "Mentor", "Coach",
      // or comma-separated "Mentor,Coach".  We pick the first valid value.
      let type = '';
      const rawType = rawData['type'] || '';
      const typeCandidates = rawType.split(',').map((t) => t.trim().toLowerCase());
      for (const candidate of typeCandidates) {
        if (candidate === 'mentor' || candidate === 'coach') {
          type = candidate;
          break;
        }
      }
      if (!type) {
        // Default to 'mentor' if the cell is non-empty but unrecognised
        if (rawType) {
          type = 'mentor';
          console.warn(`Row ${rowNum}: Unrecognised type "${rawType}", defaulting to "mentor"`);
        } else {
          throw new Error(
            `Row ${rowNum}: Missing required field "type" (Support Style must be "Mentor" or "Coach")`,
          );
        }
      }

      // ── Resolve email ─────────────────────────────────────────────────
      const email = (rawData['email'] || '').toLowerCase().trim();
      if (!email) {
        throw new Error(`Row ${rowNum}: Missing required field "email"`);
      }

      // ── Bio / About ───────────────────────────────────────────────────
      // In the Airtable export "Bio" maps to the 4th column (index 3) and
      // "About / expertise" maps to the 8th column (index 7).
      // If only one of them is present we use it for both.
      const bio = rawData['bio'] || rawData['about'] || '';
      const about = rawData['about'] || rawData['bio'] || '';

      if (!bio) {
        throw new Error(`Row ${rowNum}: Missing required field "bio"`);
      }

      // ── Booking link ──────────────────────────────────────────────────
      // May be a real URL or a placeholder like "I will share after approval"
      let bookingLink = rawData['bookingLink'] || '';
      if (!bookingLink) {
        // Try to fall back to the contactMethod column
        const contactMethod = rawData['contactMethod'] || '';
        if (/booking\s*link/i.test(contactMethod)) {
          bookingLink = 'Booking Link (to be provided)';
        } else if (/email/i.test(contactMethod)) {
          bookingLink = `mailto:${email}`;
        } else if (contactMethod) {
          bookingLink = contactMethod;
        } else {
          bookingLink = `mailto:${email}`; // last resort
        }
      }

      // ── Skills ────────────────────────────────────────────────────────
      const skills = rawData['skills']
        ? rawData['skills']
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      // ── Languages ─────────────────────────────────────────────────────
      const languages = rawData['languages']
        ? rawData['languages']
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

      // ── Experience years ──────────────────────────────────────────────
      // Not present in this CSV; default to 0
      let experienceYears = 0;
      if (rawData['experienceYears']) {
        const parsed = parseInt(rawData['experienceYears'], 10);
        if (!isNaN(parsed)) experienceYears = parsed;
      }

      // ── Hourly rate ───────────────────────────────────────────────────
      // The CSV stores free-text price ranges like "$100 to $250 per session"
      // We extract the first number we find, or default to 0.
      let hourlyRate = 0;
      if (rawData['hourlyRate']) {
        const numMatch = rawData['hourlyRate'].match(/[\d]+(?:[.,]\d+)?/);
        if (numMatch) {
          hourlyRate = parseFloat(numMatch[0].replace(',', '.'));
        }
      }

      // ── isPaidSession ─────────────────────────────────────────────────
      const isPaidRaw = String(rawData['isPaidSession'] || '')
        .toLowerCase()
        .trim();
      const isPaidSession =
        isPaidRaw === 'true' || isPaidRaw === '1' || isPaidRaw === 'yes' || isPaidRaw === 'y';

      // ── JSON sub-arrays ───────────────────────────────────────────────
      let support: Array<{ title: string; description: string }> = [];
      if (rawData['support']) {
        try {
          support = JSON.parse(rawData['support']);
        } catch {
          // Not JSON – ignore
        }
      }

      let experience: Array<{ title: string; description: string }> = [];
      if (rawData['experience']) {
        try {
          experience = JSON.parse(rawData['experience']);
        } catch {
          // Not JSON – ignore
        }
      }

      // ── Image URL ─────────────────────────────────────────────────────
      const imageUrl = extractUrl(rawData['imageUrl'] || '');

      // ── Upsert User ───────────────────────────────────────────────────
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          firstName,
          lastName,
          email,
          phone: rawData['phone'] || undefined,
          role: 'non-member',
          isVerified: true,
        });
      }

      // ── Build payload ─────────────────────────────────────────────────
      const payload: Record<string, unknown> = {
        userId: user._id,
        firstName,
        lastName,
        email,
        phone: rawData['phone'] || undefined,
        address: rawData['address'] || undefined,
        designation: rawData['designation'] || undefined,
        bio,
        about,
        type,
        skills,
        languages,
        experienceYears,
        linkedin: rawData['linkedin'] || '',
        website: rawData['website'] || '',
        isPaidSession,
        hourlyRate,
        bookingLink,
        motivation: rawData['motivation'] || '',
        goal: rawData['goal'] || '',
        isApproved: true,
        isActive: true,
        support,
        experience,
        image: {
          url: imageUrl || 'https://res.cloudinary.com/default-placeholder-mentor-coach.png',
          public_id: '',
        },
      };

      // ── Upsert JoinMentorCoach ────────────────────────────────────────
      const existing = await JoinMentorCoach.findOne({ email });
      if (existing) {
        await JoinMentorCoach.findByIdAndUpdate(existing._id, payload, { new: true });
        updatedCount++;
      } else {
        await JoinMentorCoach.create(payload);
        createdCount++;
      }
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { total: createdCount + updatedCount, createdCount, updatedCount, errors };
};

const JoinMentorsAndCoachService = {
  createJoinMentorsAndCoachIntoDB,
  getAllJoinMentorsAndCoaches,
  getSingleJoinMentorsAndCoach,
  approvedJoinMentorsAndCoach,
  toggleMentorAndCoachActive,
  getApprovedJoinMentorsAndCoaches,
  bulkUploadMentorsAndCoaches,
};

export default JoinMentorsAndCoachService;
