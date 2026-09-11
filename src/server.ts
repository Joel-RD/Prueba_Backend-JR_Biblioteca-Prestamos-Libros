import app from './app.js'
import { envConfig } from './config.js'

const { port } = envConfig;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});