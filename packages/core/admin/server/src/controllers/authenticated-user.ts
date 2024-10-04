import type { Context } from 'koa';
import type { AdminUser } from '../../../shared/contracts/shared';

import { getService } from '../utils';
import { validateProfileUpdateInput } from '../validation/user';
import { GetMe, GetOwnPermissions, UpdateMe } from '../../../shared/contracts/users';

export default {
  async getMe(ctx: Context) {
    const userInfo = getService('user').sanitizeUser(ctx.state.user as AdminUser);

    ctx.body = {
      data: userInfo,
    } satisfies GetMe.Response;
  },

  async updateMe(ctx: Context) {
    const input = ctx.request.body as UpdateMe.Request['body'];

    await validateProfileUpdateInput(input);

    const userService = getService('user');
    const authServer = getService('auth');

    const { currentPassword, ...userInfo } = input;

    if (currentPassword && userInfo.password) {
      const isValid = await authServer.validatePassword(currentPassword, ctx.state.user.password);

      if (!isValid) {
        // @ts-expect-error - refactor ctx bad request to take a second argument
        return ctx.badRequest('ValidationError', {
          currentPassword: ['Invalid credentials'],
        });
      }
    }

    // EMAIL UPDATE AND VALIDATION START
    const userAdmin = getService('user').sanitizeUser(ctx.state.user as AdminUser);
    const optionalUserAdmin = await strapi.db
      .query('admin::user')
      .findOne({ where: { email: input.email } });

    // Check if user with this email already exists
    if (input.email !== userAdmin.email) {
      if (optionalUserAdmin?.id && optionalUserAdmin?.id !== userAdmin.id) {
        return ctx.badRequest('Istneje już użytkownik o podanym adresie email');
      }
    }

    // Update user email in users-permissions plugin
    const currentUserPlugin = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { email: userAdmin.email } });
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: currentUserPlugin.id },
      data: { email: input.email, username: input.email },
    });
    // EMAIL UPDATE AND VALIDATION END

    const updatedUser = await userService.updateById(ctx.state.user.id, userInfo);

    ctx.body = {
      data: userService.sanitizeUser(updatedUser),
    } satisfies UpdateMe.Response;
  },

  async getOwnPermissions(ctx: Context) {
    const { findUserPermissions, sanitizePermission } = getService('permission');
    const { user } = ctx.state;

    const userPermissions = await findUserPermissions(user as AdminUser);

    ctx.body = {
      // @ts-expect-error - transform response type to sanitized permission
      data: userPermissions.map(sanitizePermission),
    } satisfies GetOwnPermissions.Response;
  },
};
