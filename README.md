# CustomerSupportGPT
CustomerSupportGPT is a developer template for building AI-powered chat support systems. It helps businesses provide instant, accurate, and personalized support to their customers 24/7. Whether it's answering FAQs, troubleshooting issues, or guiding customers through complex processes, CustomerSupportGPT is here to assist.

Built with Next.js and styled with Tailwind CSS, this application offers a seamless user experience with real-time chat support.

## Live Demo

[https://customer-support-gpt-metaschool.vercel.app/](https://customer-support-gpt-metaschool.vercel.app/)

## Features

- Instant, accurate, and personalized support using OpenAI's GPT-4o model.
- Create and manage multiple bots tailored to different customer support needs.
- Upload documents to create a knowledge base for the AI to reference.
- Engage customers in real-time through a chat interface.

## Technologies Used

- Next.js 14 for building the fullstack web app.
- OpenAI API for Advanced natural language understanding and generation.
- MongoDB, a NoSQL database for storing user data, bot configurations, and chat histories.
- Jose for secure user authentication and authorization.
- bcryptjs for password hashing for enhanced security.

## Use cases

- Instant customer support for FAQs and common issues.
- Troubleshooting and guiding customers through complex processes.
- Personalized support based on customer interactions.
- Real-time chat interface for engaging customers.

## Installation Steps

1. Clone the repository:

```
git clone https://github.com/0xmetaschool/CustomerSupportGPT.git
```

2. Navigate to the project directory:

```
cd CustomerSupportGPT
```

3. Install dependencies:

```
npm install
```

4. Set up the database:

Ensure you have MongoDB installed and running on your system, or use a cloud-hosted MongoDB service like MongoDB Atlas. Create a new Cluster, select a free plan, and copy the connection string, this will be required in the next step.

5. Set up environment variables:

Create a .env.local file in the root directory and add the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret  
OPENAI_API_KEY=your_openai_api_key
ENCRYPTION_KEY=your_encryption_key
```

6. Start the development server:

```
npm run dev
```

Open your browser and navigate to http://localhost:3000

## Screenshots

<div style="display: flex; justify-content: space-between;">
  <img src="https://github.com/0xmetaschool/CustomerSupportGPT/blob/main/screenshots/customer-support-gpt-template-dashboard.png?raw=true" alt="CustomerSupport GPT Template Dashboard screenshot" style="width: 49%; border: 2px solid black;" />
  <img src="https://github.com/0xmetaschool/CustomerSupportGPT/blob/main/screenshots/customer-support-gpt-template-demo.png?raw=true" alt="CustomerSupport GPT Template Demo screenshot" style="width: 49%; border: 2px solid black;"/>

</div>

<div style="display: flex; justify-content: space-between;">
  <img src="https://github.com/0xmetaschool/CustomerSupportGPT/blob/main/screenshots/customer-support-gpt-template-home.png?raw=true" alt="CustomerSupport GPT Template Homepage screenshot" style="width: 49%; border: 2px solid black;"/>
  <img src="https://github.com/0xmetaschool/CustomerSupportGPT/blob/main/screenshots/customer-support-gpt-template-manage-bot.png?raw=true?raw=true" alt="CustomerSupport GPT Template Manage Bot screenshot" style="width: 49%; border: 2px solid black;" />
</div>

## How to use the application

1. Create a new account or sign in to your existing one.
2. Create a new bot and upload documents to create a knowledge base for the AI to reference.
3. Add the embed code to your website to enable the chat support widget.

## Contributing

We love contributions! Here's how you can help make the project even better:

- Fork the project (gh repo fork https://github.com/0xmetaschool/customer-support-gpt.git)
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Contact
Please open an issue in the GitHub repository for any queries or support.
