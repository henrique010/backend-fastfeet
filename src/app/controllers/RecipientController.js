import * as Yup from 'yup';
import axios from 'axios';
import Recipient from '../models/Recipient';
import cepConfig from '../../config/cep';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      cep: Yup.string()
        .required()
        .length(9),
      name: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const { cep, name, number, complement } = req.body;

    const response = await axios.get(`${cepConfig.url}=${cep}`);

    if (response.data.status !== 200) {
      return res.status(404).json({ error: 'Cep not found' });
    }

    const { address: street, city, state } = response.data;

    const recipientsExists = await Recipient.findOne({
      where: { street, number, city, state },
    });

    if (recipientsExists) {
      return res.status(400).json({ error: 'Recipient already exists' });
    }

    const recipient = await Recipient.create({
      name,
      number,
      street,
      city,
      state,
      cep,
      complement: complement || '',
    });

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      cep: Yup.string().length(9),
      name: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const recipient = await Recipient.findByPk(req.body.id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    if (req.body.cep && req.body.cep !== recipient.cep) {
      const response = await axios.get(`${cepConfig.url}=${req.body.cep}`);

      if (response.data.status !== 200) {
        return res.status(404).json({ error: 'Cep not found' });
      }

      if (!req.body.number) {
        return res.status(404).json({ error: 'New number not informed' });
      }

      const { address: street, city, state } = response.data;

      req.body = { ...req.body, street, city, state };
    }

    const recipientUpdated = await recipient.update(req.body);

    return res.json(recipientUpdated);
  }
}

export default new RecipientController();
