const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

let databaseRef;

const uri = "mongodb+srv://swonlineUser:KmhgPQtWTP3XKT1H@mainclusterm0.wec8a.mongodb.net/chatterFlex?retryWrites=true&w=majority&appName=MainClusterM0";

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        databaseRef = client.db();
        app.listen(5000, ('0.0.0.0'),() => {
            console.log("Server is running on port 5000");
        });
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
    });

app.post("/setmessage", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        await databaseRef.collection('message').insertOne({
            message,
            receivedAt: new Date()
        });
        res.status(200).json({ success: true, message: "Message saved successfully" });
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Failed to save message" });
    }
});

app.get("/getmessage", async (req, res) => {
    try {
        const latestMessage = await databaseRef.collection("message")
            .find({})
            .sort({ receivedAt: -1 })
            .limit(1)
            .toArray();

        if (latestMessage.length === 0) {
            return res.status(404).json({ message: "No messages found" });
        }

        res.status(200).json({ message: latestMessage[0].message, timestamp: latestMessage[0].receivedAt });
    } catch (error) {
        console.error("Error fetching latest message:", error);
        res.status(500).json({ message: "Error fetching latest message", error });
    }
});
