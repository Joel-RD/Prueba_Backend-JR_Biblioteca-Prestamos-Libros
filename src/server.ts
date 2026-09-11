import app from '../src/app.js'
import {configParams} from '../src/config_params.js'

const {port} = configParams;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});