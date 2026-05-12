export const welcomeEmailTemplate = (name: string, communityLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Community</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
            color: #1a1a1a;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
        }
        .content p {
            margin-bottom: 24px;
            font-size: 16px;
            color: #4b5563;
        }
        .content strong {
            color: #111827;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .button {
            background-color: #3b82f6;
            color: #ffffff !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s ease;
            display: inline-block;
        }
        .note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin-top: 30px;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #9ca3af;
            background-color: #f9fafb;
            border-top: 1px solid #f3f4f6;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Success! You're In.</h1>
        </div>
        <div class="content">
            <p>Hello, ${name}!</p>
            <p>We are thrilled to welcome you! Your membership is now active, and you have full access to our exclusive community features.</p>
            
            <p><strong>You are now a member.</strong> You can dive straight into the discussions, resources, and connections waiting for you.</p>

            <div class="button-container">
                <a href="${communityLink}" class="button">Access the Community</a>
            </div>

            <div class="note">
                <strong>Note:</strong> You'll use your Mighty Networks credentials to chat with the team!
            </div>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Act On Climate. All rights reserved.<br>
            If you have any questions, feel free to reply to this email.
        </div>
    </div>
</body>
</html>
`;
