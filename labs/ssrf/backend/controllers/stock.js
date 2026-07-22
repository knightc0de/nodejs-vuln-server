const stockRouter = require('express').Router()


/**
 * inventory stock object with prototype pollution protection
 * @type {{ phone: number, tablet: number, usb: number, tv: number }}
 */
// prevent prototype pollution
const stock = Object.assign(Object.create(null), {
  phone: 412,
  tablet: 104,
  usb: 872,
  tv: 101
})

/**
 * POST /api/stock/:name
 * @summary stock endpoint
 * @description adds an endpoint where users will post the name of the stock and recive the count as json
 *
 * @route POST /api/stock/{name}
 * @param {Object} req - express request object containing the params
 * @param {Object} req.params.id - the name of the stock recived from the request
 * @param {Object} res - the response obj
 *
 * @returns {Promise<void>} resolves with json response:
 * - 200 ok: user obj
 * - 404 not found: `{ message:"item not in stock" }`
 * - 500 internal server error: `{ error: "internal server error"}`
 */

stockRouter.post('/stock/:name', async (req, res) => {
  try {
    const itemName = req.params.name
    if (typeof(itemName) != 'string')
      return res.status(500).json({ message:"parameter name only supports type string" })
    
    if (!(itemName in stock))
      return res.status(404).json({ message:"item not in stock" })
    
    res.status(200).json({ count:stock[itemName] })

  } catch (err){
    console.error(err)
    return res.status(500).json({ message:"internal server error" })
  }
})


/**
 * express router singleton
 * @module controllers/stock
 */

module.exports = stockRouter
