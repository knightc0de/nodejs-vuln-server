/**
 * @file controllers/admin.js
 * @description express router handling the admin router with
 */

const adminRouter = require('express').Router()


/**
 * GET /api/users/:id
 * @summary fetch the success message
 * @description recives a post request from the frontend then validates the ip to make sure its actually coming from the frontend
 *
 * @route GET /api/admin
 * @param {Object} req - express request object
 * @param {Object} res - the response object
 * 
 * @returns {Promise<void>} resolves with json response:
 * - 200 ok: user obj
 * - 500 internal server error: `{ error: "internal server error" }`
 */


adminRouter.get('/admin', (req, res) => {
  try {
  const clientIp = req.ip || req.connection.remoteAddress

  const isLocalhost = 
        clientIp === '127.0.0.1' || 
        clientIp === '::1' || 
        clientIp === '::ffff:127.0.0.1'
  if(!isLocalhost){
    return res.status(403).json({ 
            success: false, 
            message: "access restricted" 
            });
  }
  return res.status(200).json({
    success:true
  })
  } catch (err) {
    console.error(err)
    return res.status(500).json({error:"internal server error"})
  }
})

/**
 * express router singleton
 * @module controllers/admin
 */

module.exports = adminRouter
