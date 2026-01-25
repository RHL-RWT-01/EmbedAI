import { Router } from 'express';
import { authenticate, requireTenant } from '../middleware/index';
import { analyticsService } from '../services/index';

const router = Router();

// Get analytics overview
router.get('/overview', authenticate, requireTenant, async (req, res, next) => {
    try {
        const { period } = req.query;
        const validPeriod = ['day', 'week', 'month'].includes(period as string)
            ? (period as 'day' | 'week' | 'month')
            : 'week';
        const result = await analyticsService.getOverview(req.user!.tenantId!, validPeriod);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get usage statistics
router.get('/usage', authenticate, requireTenant, async (req, res, next) => {
    try {
        const { period } = req.query;
        const validPeriod = ['day', 'week', 'month'].includes(period as string)
            ? (period as 'day' | 'week' | 'month')
            : 'week';
        const result = await analyticsService.getUsage(req.user!.tenantId!, validPeriod);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
