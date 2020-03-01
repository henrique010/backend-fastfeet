import Package from '../models/Package';
import Recipient from '../models/Recipient';

class DeliveryController {
  async index(req, res) {
    const packages = await Package.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
      attributes: ['id', 'product', 'start_date', 'createdAt'],
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
export default new DeliveryController();
