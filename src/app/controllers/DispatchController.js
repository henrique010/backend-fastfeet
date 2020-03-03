import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import DeliveryProblem from '../models/DeliveryProblem';

import Queue from '../../lib/Queue';
import CancellatinMail from '../jobs/CancellationMail';

class DispatchController {
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

  async delete(req, res) {
    const deliveryProblem = await DeliveryProblem.findByPk(req.params.pack_id, {
      include: [
        {
          model: Package,
          as: 'delivery',
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
            },
            {
              model: Recipient,
              as: 'recipient',
            },
          ],
        },
      ],
    });

    if (!deliveryProblem) {
      return res.status(404).json({ error: 'Delivery problem not found' });
    }

    const pack = await Package.findByPk(deliveryProblem.delivery_id);

    const cancelledPack = await pack.update({
      canceled_at: new Date(),
    });

    const { description, delivery } = deliveryProblem;
    const { deliveryman, recipient, canceled_at } = delivery;

    await Queue.add(CancellatinMail.key, {
      problem: description,
      date: canceled_at,
      pack: cancelledPack,
      deliveryman,
      recipient,
    });

    return res.json(deliveryProblem);
  }
}
export default new DispatchController();
