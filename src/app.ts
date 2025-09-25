import express from 'express';
import routers from '../src/routers/books_all.js'

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(routers)

export default app;