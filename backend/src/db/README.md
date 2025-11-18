# Database Access

Use the Prisma client singleton to access the database:

```js
const { getPrisma } = require('./prisma');
const prisma = getPrisma();

async function example() {
  const users = await prisma.user.findMany();
  return users;
}
```

Environment:
- DATABASE_URL defaults to SQLite file: ./data/dev.db
- To switch to Postgres later, set `DATABASE_PROVIDER=postgresql` and provide a Postgres `DATABASE_URL`.
