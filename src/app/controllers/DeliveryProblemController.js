import * as Yup from 'yup';
import Package from '../models/Package';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
  async index(req, res) {
    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: req.params.pack_id,
      },
      attributes: ['id', 'description', 'createdAt'],
    });

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const pack = await Package.findByPk(req.params.pack_id);

    if (!pack) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const { description } = req.body;

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id: req.params.pack_id,
      description,
    });

    return res.json(deliveryProblem);
  }
}

export default new DeliveryProblemController();
