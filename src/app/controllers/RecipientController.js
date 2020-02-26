import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    return res.json({ ok: true });
  }

  async update(req, res) {
    return res.json({ ok: true });
  }
}

export default new RecipientController();
