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

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery man does not exists' });
    }

    if (req.body.email && req.body.email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({
        where: { email: req.body.email },
      });

      if (deliverymanExists) {
        return res
          .status(400)
          .json({ error: 'There is already a deliveryman with this email' });
      }
    }

    await deliveryman.update(req.body);
    const { id, name, email, avatar } = await deliveryman.reload({
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });

    return res.json({ id, name, email, avatar });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    await deliveryman.destroy();

    return res.json();
  }
}
export default new DeliverymanController();
