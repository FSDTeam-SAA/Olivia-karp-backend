const serverTemplate = (): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Olivia Karp API | Status</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #6366f1;
                --bg: #0f172a;
                --card-bg: rgba(30, 41, 59, 0.7);
                --text: #f8fafc;
                --success: #10b981;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                background-color: var(--bg);
                background-image: 
                    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text);
                overflow: hidden;
            }

            .container {
                position: relative;
                z-index: 1;
                text-align: center;
                padding: 2rem;
                background: var(--card-bg);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                max-width: 450px;
                width: 90%;
                animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(16, 185, 129, 0.1);
                color: var(--success);
                padding: 6px 16px;
                border-radius: 100px;
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
                border: 1px solid rgba(16, 185, 129, 0.2);
            }

            .pulse {
                width: 8px;
                height: 8px;
                background-color: var(--success);
                border-radius: 50%;
                box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }

            h1 {
                font-size: 2.25rem;
                font-weight: 700;
                letter-spacing: -0.025em;
                margin-bottom: 0.5rem;
                background: linear-gradient(to right, #fff, #94a3b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            p {
                color: #94a3b8;
                line-height: 1.6;
                margin-bottom: 2rem;
            }

            .btn {
                display: inline-block;
                background: var(--primary);
                color: white;
                text-decoration: none;
                padding: 12px 28px;
                border-radius: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
            }

            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
                background: #4f46e5;
            }

            .footer {
                margin-top: 2rem;
                font-size: 0.75rem;
                color: #64748b;
            }

            .shapes div {
                position: absolute;
                border-radius: 50%;
                filter: blur(60px);
                z-index: 0;
            }

            .shape-1 {
                top: 10%;
                left: 10%;
                width: 300px;
                height: 300px;
                background: rgba(99, 102, 241, 0.1);
            }

            .shape-2 {
                bottom: 10%;
                right: 10%;
                width: 250px;
                height: 250px;
                background: rgba(16, 185, 129, 0.05);
            }
        </style>
    </head>
    <body>
        <div class="shapes">
            <div class="shape-1"></div>
            <div class="shape-2"></div>
        </div>
        <div class="container">
            <div class="status-badge">
                <span class="pulse"></span>
                SYSTEM OPERATIONAL
            </div>
            <h1>Olivia Karp API</h1>
            <p>Welcome to the premium backend services of Olivia Karp. Our systems are fully functional and ready to serve.</p>
            <a href="/api/v1" class="btn">Explore API Endpoints</a>
            <div class="footer">
                v1.0.0 &bull; Running on Production Node.js
            </div>
        </div>
    </body>
    </html>
  `;
};

export default serverTemplate;
