import { hashSync } from 'bcryptjs';

const hashUserPin = (pwd) => {
    return hashSync(pwd, 10);
};

export function recordAuthorPlugin(schema, options) {
    schema.pre('save', function (next) {
        let doc = this;

        if (doc.vAuthUser !== undefined) {
            doc.updatedById = doc.createdById = doc.vAuthUser;
        }

        next();
    });

    schema.pre('updateOne', function (next) {
        let changes = this.getUpdate().$set;

        if (changes.vAuthUser !== undefined) {
            changes.updatedById = changes.vAuthUser;
        }

        next();
    });

    schema.pre('findOneAndUpdate', function (next) {
        let changes = this.getUpdate().$set;

        if (changes.vAuthUser !== undefined) {
            changes.updatedById = changes.vAuthUser;
        }

        next();
    });
};

export function hashUserPinPlugin(schema, options) {
    schema.pre('save', function (next) {
        let doc = this;

        if (doc.userPin !== undefined) {
            doc.userPin = hashUserPin(doc.userPin);
        }
        next();
    });

    schema.pre('updateOne', function (next) {
        let changes = this.getUpdate().$set;

        if (changes.userPin !== undefined) {
            changes.userPin = hashUserPin(changes.userPin);
        }
        next();
    });
};
