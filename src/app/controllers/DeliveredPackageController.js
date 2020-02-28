import { Op } from 'sequelize';
import Package from '../models/Package';
import Recipient from '../models/Recipient';

class DeliveryPackageController {
  async index(req, res) {
    const packages = await Package.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        start_date: {
          [Op.ne]: null,
        },
        end_date: {
          [Op.ne]: null,
        },
      },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'number',
            'street',
            'city',
            'state',
            'cep',
          ],
        },
      ],
    });

    return res.json(packages);
  }
}
export default new DeliveryPackageController();
