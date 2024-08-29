// eslint-disable-file no-use-before-define
import { ErrorCode, MilvusClient } from '@zilliz/milvus2-sdk-node';

(async () => {
  const collectionName = 'tweet_embedding';
  try {
    const milvusClient = new MilvusClient({
      // address: `${process.env.DB_MILVUS_HOST}:${process.env.DB_MILVUS_PORT}`, // Replace with your Milvus server address
      // username: process.env.DB_MILVUS_USERNAME, // Optional
      // password: process.env.DB_MILVUS_PASSWORD, // Optional
      // database: process.env.DB_MILVUS_DATABASE, // Optional
      address: 'localhost:19530',
      database: 'default', // Optional
    });

    // Check if the collection exists
    const hasCollection = await milvusClient.hasCollection({
      collection_name: collectionName,
    });
    if (
      hasCollection.status.error_code !== ErrorCode.SUCCESS ||
      !hasCollection.value
    ) {
      console.error(`Collection "${collectionName}" does not exist.`);
      return;
    }

    // Get collection statistics
    const collectionStats = await milvusClient.getCollectionStatistics({
      collection_name: collectionName,
    });

    if (collectionStats.status.error_code === ErrorCode.SUCCESS) {
      console.log(
        `Collection size for "${collectionName}":`,
        collectionStats.stats,
      );
    } else {
      console.error(
        `Failed to get collection statistics: ${collectionStats.status.reason}`,
      );
    }

    // Get the health status (describe the collection to check its state)
    const collectionInfo = await milvusClient.describeCollection({
      collection_name: collectionName,
    });

    if (collectionInfo.status.error_code === ErrorCode.SUCCESS) {
      console.log(
        `Collection "${collectionName}" health status:`,
        collectionInfo,
      );
    } else {
      console.error(
        `Failed to describe collection: ${collectionInfo.status.reason}`,
      );
    }

    // Check the system memory and other statistics using the `getMetrics` API
    const metrics = await milvusClient.getMetric({
      request: { metric_type: 'system_info' },
    });

    if (metrics.status.error_code === ErrorCode.SUCCESS) {
      console.log(
        'Milvus Node Statistics:',
        JSON.stringify(metrics.response, null, 2),
      );
    } else {
      console.error(
        'Failed to get Milvus node statistics:',
        metrics.status.reason,
      );
    }

    const loadState = await milvusClient.getLoadState({
      collection_name: collectionName,
    });
    console.log(
      `Collection "${collectionName}" load state: ${loadState.state}`,
    );

    // const m = await milvusClient.checkHealth();
    // console.log('🚀 ~ m:', m);
    // const loadResp = await milvusClient.loadCollectionSync({
    //   collection_name: collectionName,
    // });
    // console.log('🚀 ~ loadResp:', loadResp);
  } catch (error) {
    console.error('Error checking collection load state:', error);
  }
})();
