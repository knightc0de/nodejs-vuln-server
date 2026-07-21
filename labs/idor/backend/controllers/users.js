const userRouter = require('express').Router()
const fs = require('fs/promises')
const path = require('path')

const PATH = path.join(__dirname, '../data/users.json');

userRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const rawData = await fs.readFile(PATH, 'utf8')
    const parsedData = JSON.parse(rawData)
    const users = parsedData.users || []
    const user = users.find(u => String(u.id) === String(id))

    if (!user){
      return res.status(404).json({message:"user not found"})
    }

    res.json(user)
  } catch (err) {
    console.error(err)
    
    if (err.code == 'ENOENT'){
      return res.status(404).json({ error: 'data not found' })
    }
    return res.status(500).json({ error: 'server error' })
  }
})

module.exports = userRouter
