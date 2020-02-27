import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliveryPeople = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'url', 'path'],
        },
      ],
    });

    return res.json(deliveryPeople);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const deliveryManExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliveryManExists) {
      return res.status(400).json({ error: 'Delivery man already exists' });
    }

    const { name, email } = req.body;

    const deliveryMan = await Deliveryman.create({ name, email });

    const { id } = deliveryMan;

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryMan = await Deliveryman.findByPk(id);

    if (!deliveryMan) {
      return res.status(400).json({ error: 'Delivery man not found' });
    }

    await deliveryMan.destroy();

    return res.json();
  }
}
export default new DeliverymanController();
