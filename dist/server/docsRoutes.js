import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
const router = Router();
router.get('/privacy-policy', async (req, res) => {
    try {
        const filePath = path.join(process.cwd(), 'docs', 'privacy-policy.md');
        const content = await fs.readFile(filePath, 'utf-8');
        res.send(content);
    }
    catch (error) {
        console.error('Error reading privacy policy:', error);
        res.status(404).send('Privacy policy not found');
    }
});
router.get('/terms-and-conditions', async (req, res) => {
    try {
        const filePath = path.join(process.cwd(), 'docs', 'terms-and-conditions.md');
        const content = await fs.readFile(filePath, 'utf-8');
        res.send(content);
    }
    catch (error) {
        console.error('Error reading terms and conditions:', error);
        res.status(404).send('Terms and conditions not found');
    }
});
export default router;
