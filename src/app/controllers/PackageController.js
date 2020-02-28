import * as Yup from 'yup';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
// import Deliveryman from '../models/Deliveryman';
// import File from '../models/File';

class PackageController {
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

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const pack = await Package.create(req.body);

    return res.json(pack);
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new PackageController();
