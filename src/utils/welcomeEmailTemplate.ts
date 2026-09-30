export const welcomeEmailTemplate = (
  name: string,
  communityLink: string,
  dashboardLink: string = "https://actonclimate.net/dashboard"
) => {
  const baseSiteUrl = dashboardLink.replace(/\/dashboard\/?$/, "");
  const coursesLink = `${baseSiteUrl}/courses`;
  const eventsLink = `${baseSiteUrl}/events`;

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Act On Climate</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
            color: #1a1a1a;
            -webkit-text-size-adjust: 100%;
        }
        .container {
            max-width: 600px;
            margin: 24px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, #0d5f57 0%, #1e3a8a 100%);
            padding: 38px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header-badge {
            display: inline-block;
            background-color: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 4px 12px;
            border-radius: 999px;
            margin-bottom: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
        }
        .content {
            padding: 36px 30px;
        }
        .content p {
            margin: 0 0 16px 0;
            font-size: 15px;
            color: #4b5563;
            line-height: 1.6;
        }
        .status-card {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-left: 4px solid #16a34a;
            border-radius: 6px;
            padding: 14px 16px;
            margin: 20px 0 28px 0;
        }
        .status-title {
            font-size: 14px;
            font-weight: 700;
            color: #15803d;
            margin: 0 0 4px 0;
        }
        .status-text {
            font-size: 13px;
            color: #166534;
            margin: 0 !important;
            line-height: 1.5;
        }
        .section-heading {
            font-size: 17px;
            font-weight: 700;
            color: #111827;
            margin: 28px 0 16px 0;
            display: flex;
            align-items: center;
        }
        .step-card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px 18px;
            margin-bottom: 14px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        .step-badge {
            display: inline-block;
            background-color: #1e3a8a;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            margin-right: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            vertical-align: middle;
        }
        .step-title {
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
            vertical-align: middle;
        }
        .step-desc {
            font-size: 13.5px;
            color: #4b5563;
            margin: 8px 0 10px 0 !important;
            line-height: 1.5;
        }
        .step-action-link {
            font-size: 13px;
            font-weight: 600;
            color: #2563eb;
            text-decoration: none;
            display: inline-block;
        }
        .step-action-link:hover {
            text-decoration: underline;
        }
        .button-group {
            text-align: center;
            margin: 32px 0 16px 0;
        }
        .btn-primary {
            background-color: #2563eb;
            color: #ffffff !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            margin: 6px;
        }
        .btn-secondary {
            background-color: #f8fafc;
            color: #1e3a8a !important;
            border: 1px solid #cbd5e1;
            padding: 13px 26px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            margin: 6px;
        }
        .note {
            background-color: #fefce8;
            border-left: 4px solid #eab308;
            padding: 14px 16px;
            margin-top: 28px;
            border-radius: 4px;
            font-size: 13px;
            color: #854d0e;
            line-height: 1.5;
        }
        .footer {
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            background-color: #f9fafb;
            border-top: 1px solid #f3f4f6;
            line-height: 1.6;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
                border: none;
            }
            .content {
                padding: 24px 18px;
            }
            .btn-primary, .btn-secondary {
                display: block;
                margin: 8px 0;
            }
        }
    </style>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0;">
    <div class="container" style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <!-- Header -->
        <div class="header" style="background: linear-gradient(135deg, #0d5f57 0%, #1e3a8a 100%); padding: 38px 24px; text-align: center; color: #ffffff;">
            <div class="header-badge" style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px;">
                Membership Active &amp; Confirmed
            </div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">Welcome to Act On Climate!</h1>
        </div>

        <!-- Content -->
        <div class="content" style="padding: 36px 30px;">
            <p style="margin: 0 0 16px 0; font-size: 15px; color: #4b5563;">Hello <strong>${name}</strong>,</p>
            <p style="margin: 0 0 16px 0; font-size: 15px; color: #4b5563;">
                We are thrilled to welcome you to the team! Your membership payment has been confirmed, your account is fully set up, and you now have unrestricted access to all member-exclusive resources and community privileges.
            </p>

            <!-- Reassurance Confirmation Box -->
            <div class="status-card" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 6px; padding: 14px 16px; margin: 20px 0 28px 0;">
                <div class="status-title" style="font-size: 14px; font-weight: 700; color: #15803d; margin-bottom: 4px;">
                    &#10003; Survey Completed &amp; Profile Synchronized
                </div>
                <div class="status-text" style="font-size: 13px; color: #166534; line-height: 1.5;">
                    Your onboarding survey responses have been safely saved to your profile. You do <strong>not</strong> need to fill in the survey again—everything is ready for your member journey!
                </div>
            </div>

            <!-- Next Steps -->
            <div class="section-heading" style="font-size: 17px; font-weight: 700; color: #111827; margin: 28px 0 16px 0;">
                Your Next Steps:
            </div>

            <!-- Step 1 -->
            <div class="step-card" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; margin-bottom: 14px;">
                <div>
                    <span class="step-badge" style="background-color: #1e3a8a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Step 1</span>
                    <strong class="step-title" style="font-size: 15px; color: #1f2937;">Access Mighty Networks Community</strong>
                </div>
                <p class="step-desc" style="font-size: 13.5px; color: #4b5563; margin: 8px 0 10px 0; line-height: 1.5;">
                    Join our private climate network, introduce yourself to fellow members, exchange insights, and collaborate on climate solutions.
                </p>
                <a href="${communityLink}" class="step-action-link" style="font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none;">
                    Go to Mighty Networks Community &rarr;
                </a>
            </div>

            <!-- Step 2 -->
            <div class="step-card" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; margin-bottom: 14px;">
                <div>
                    <span class="step-badge" style="background-color: #1e3a8a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Step 2</span>
                    <strong class="step-title" style="font-size: 15px; color: #1f2937;">Explore Courses and Upcoming Events</strong>
                </div>
                <p class="step-desc" style="font-size: 13.5px; color: #4b5563; margin: 8px 0 10px 0; line-height: 1.5;">
                    Discover curated climate educational workshops, masterclasses, and RSVP to upcoming webinars to deepen your climate impact.
                </p>
                <a href="${coursesLink}" class="step-action-link" style="font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none;">
                    Browse Courses &amp; Events &rarr;
                </a>
            </div>

            <!-- Step 3 -->
            <div class="step-card" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; margin-bottom: 14px;">
                <div>
                    <span class="step-badge" style="background-color: #1e3a8a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Step 3</span>
                    <strong class="step-title" style="font-size: 15px; color: #1f2937;">Check Your Tailored Dashboard Benefits</strong>
                </div>
                <p class="step-desc" style="font-size: 13.5px; color: #4b5563; margin: 8px 0 10px 0; line-height: 1.5;">
                    Visit your personalized member portal on our website to see custom opportunities, regional hubs, and perks matched to your survey goals.
                </p>
                <a href="${dashboardLink}" class="step-action-link" style="font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none;">
                    Open Member Dashboard &rarr;
                </a>
            </div>

            <!-- Quick Action Buttons -->
            <div class="button-group" style="text-align: center; margin: 32px 0 16px 0;">
                <a href="${communityLink}" class="btn-primary" style="background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; margin: 6px;">
                    Access Community
                </a>
                <a href="${dashboardLink}" class="btn-secondary" style="background-color: #f8fafc; color: #1e3a8a !important; border: 1px solid #cbd5e1; padding: 13px 26px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; margin: 6px;">
                    Go to Your Dashboard
                </a>
            </div>

            <!-- Helpful Note -->
            <div class="note" style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 14px 16px; margin-top: 28px; border-radius: 4px; font-size: 13px; color: #854d0e; line-height: 1.5;">
                <strong>Helpful Tip:</strong> You can log in to the Act On Climate website anytime using your registered email. If you haven't set a website password yet, click &quot;Forgot Password&quot; on the login screen to set one up in seconds. To chat with the community team on Mighty Networks, simply use your Mighty Networks credentials.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer" style="padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #f3f4f6; line-height: 1.6;">
            &copy; ${new Date().getFullYear()} Act On Climate. All rights reserved.<br>
            If you have questions or need support with your membership, feel free to reply to this email.
        </div>
    </div>
</body>
</html>
`;
};

