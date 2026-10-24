/**
 * Calculates trending score for a post based on score and age.
 * Formula: (score + 1) / ((hoursSinceCreation + 2) ^ 1.5)
 *
 * This gravity-based algorithm balances high community engagement
 * while gracefully decaying older posts to keep feeds fresh.
 */
export const calculateTrendingScore = (score, createdAt) => {
  const hoursSinceCreation = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
  return (Math.max(0, score) + 1) / Math.pow(hoursSinceCreation + 2, 1.5);
};

/**
 * Returns a MongoDB aggregation expression for calculating trending score in-database.
 */
export const getTrendingAggregationPipeline = () => {
  return [
    {
      $addFields: {
        hoursSinceCreation: {
          $divide: [
            { $subtract: [new Date(), '$createdAt'] },
            1000 * 60 * 60,
          ],
        },
      },
    },
    {
      $addFields: {
        trendingScore: {
          $divide: [
            { $add: [{ $max: ['$score', 0] }, 1] },
            {
              $pow: [
                { $add: ['$hoursSinceCreation', 2] },
                1.5,
              ],
            },
          ],
        },
      },
    },
  ];
};
