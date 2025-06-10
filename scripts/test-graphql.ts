import axios from 'axios';

const GRAPHQL_ENDPOINT = 'http://localhost:8000/graphql';

// Get JWT token from environment variable or use a default test token
const JWT_TOKEN =
  process.env.JWT_TOKEN ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYWQ1NTAwZC03Y2Q0LTRmYjItOGRhMC1kMTJiOGJkODE1YTgiLCJpYXQiOjE3MTEwMDAwMDB9.2KKXk6dUPrVyFtVvQyX3bPwGztgGZ5YvHwfLvOYo3kM';

async function executeGraphQLQuery(query: string, variables = {}) {
  try {
    console.log('Executing query:', query);
    console.log('Variables:', variables);

    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JWT_TOKEN}`,
        },
      },
    );

    if (response.data.errors) {
      console.error(
        'GraphQL Errors:',
        JSON.stringify(response.data.errors, null, 2),
      );
      throw new Error('GraphQL query failed');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Network Error:', error.message);
      if (error.response) {
        console.error(
          'Response Data:',
          JSON.stringify(error.response.data, null, 2),
        );
        console.error('Response Status:', error.response.status);
      }
    } else {
      console.error('GraphQL Error:', error);
    }
    throw error;
  }
}

async function testQueries() {
  // Test the hello query (unprotected)
  const helloQuery = `
    query {
      hello
    }
  `;

  // Test getting all users (protected)
  const usersQuery = `
    query {
      users {
        id
        username
        created_at
      }
    }
  `;

  // Test getting a single user (protected)
  const userQuery = `
    query($id: ID!) {
      user(id: $id) {
        id
        username
        metadata
        created_at
      }
    }
  `;

  // Test creating a user (protected)
  const createUserMutation = `
    mutation($username: String!, $clientId: String, $clientUid: String) {
      createUser(username: $username, client_id: $clientId, client_uid: $clientUid) {
        id
        username
        client_id
        client_uid
        created_at
      }
    }
  `;

  try {
    // Test hello query
    console.log('\nTesting hello query:');
    const helloResult = await executeGraphQLQuery(helloQuery);
    console.log(JSON.stringify(helloResult, null, 2));

    // Test users query
    console.log('\nTesting users query:');
    const usersResult = await executeGraphQLQuery(usersQuery);
    console.log(JSON.stringify(usersResult, null, 2));

    // Test get single user query
    const userId = 'cad5500d-7cd4-4fb2-8da0-d12b8bd815a8';
    console.log('\nTesting single user query:');
    const userResult = await executeGraphQLQuery(userQuery, {
      id: userId,
    });
    console.log(JSON.stringify(userResult, null, 2));

    // // Test create user mutation
    // console.log('\nTesting create user mutation:');
    // const createUserResult = await executeGraphQLQuery(createUserMutation, {
    //   username: 'testuser',
    //   clientId: 'test-client',
    //   clientUid: 'test-uid',
    // });
    // console.log(JSON.stringify(createUserResult, null, 2));
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
console.log('Starting GraphQL tests...');
console.log('Using endpoint:', GRAPHQL_ENDPOINT);

testQueries()
  .then(() => {
    console.log('\nAll tests completed successfully');
  })
  .catch((error) => {
    console.error('Tests failed:', error);
    process.exit(1);
  });
