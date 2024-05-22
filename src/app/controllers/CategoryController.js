import * as Yup from 'yup';
import Category from '../models/Category';
import User from '../models/User';

class CategoryController {
    async store(request, response) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        try {
            await schema.validateSync(request.body, { abortEarly: false });
        } catch (err) {
            return response.status(400).json({ error: err.errors });
        }

        const { admin: isAdmin } = await User.findByPk(request.userId);

        if (!isAdmin) {
            return response.status(401).json();
        }

        const { name } = request.body;
        let path;
        if (request.file) {
            path = request.file.filename;
        }

        const categoryExists = await Category.findOne({
            where: { name },
        });

        if (categoryExists) {
            return response.status(400).json({ error: 'Category already exists' });
        }

        const { id } = await Category.create({ name, path });

        return response.json({ id, name });
    }

    async index(request, response) {
        const categories = await Category.findAll();
        return response.json(categories);
    }

    async update(request, response) {
        try {
            const schema = Yup.object().shape({
                name: Yup.string(),
            });
            await schema.validateSync(request.body, { abortEarly: false });

            const { admin: isAdmin } = await User.findByPk(request.userId);

            if (!isAdmin) {
                return response.status(401).json();
            }

            const { name } = request.body;
            const { id } = request.params;

            const category = await Category.findByPk(id);

            if (!category) {
                return response.status(404).json({ error: 'Category not found' });
            }

            let path;
            if (request.file) {
                path = request.file.filename;
            }

            await Category.update({ name, path }, { where: { id } });

            return response.status(200).json();
        } catch (error) {
            return response.status(400).json({ error: error.message });
        }
    }
}

export default new CategoryController();


