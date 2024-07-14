import { app } from './app';
import { PrismaClient } from '@prisma/client/edge';
const prisma = new PrismaClient();

const port = process.env.PORT || 5000;

app.get("/", (req,res) => {
    res.json({
        msg:"Well hello there!!"
    })
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})