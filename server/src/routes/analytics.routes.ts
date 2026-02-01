import { Router } from 'express';
import { authenticate, requireTenant } from '../middleware/index';
import { analyticsService } from '../services/index';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Get analytics overview
router.get(
    '/overview',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const { period } = req.query;
        const validPeriod = ['day', 'week', 'month'].includes(period as string)
            ? (period as 'day' | 'week' | 'month')
            : 'week';
        const result = await analyticsService.getOverview(req.user!.tenantId!, validPeriod);
        res.json(result);
    })
);

// Get usage statistics
router.get(
    '/usage',
    authenticate,
    requireTenant,
    asyncHandler(async (req, res) => {
        const { period } = req.query;
        const validPeriod = ['day', 'week', 'month'].includes(period as string)
            ? (period as 'day' | 'week' | 'month')
            : 'week';
        const result = await analyticsService.getUsage(req.user!.tenantId!, validPeriod);
        res.json(result);
    })
);

export default router;

