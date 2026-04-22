import { Router } from 'express'
import {getSnippetsController, getSnippetByIdController,} from '../controllers/snippets.controller'

const router = Router()

//Get all
router.get('/', getSnippetsController)
//Get by ID
router.get('/:id', getSnippetByIdController)

export default router