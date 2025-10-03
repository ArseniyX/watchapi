import bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository";
import { User } from "@/generated/prisma";
import { OrganizationRepository } from "../organization/organization.repository";
import {
    CreateUserInput,
    CreateOAuthUserInput,
    UpdateUserInput,
} from "./user.schema";

export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly organizationRepository: OrganizationRepository
    ) {}

    async createUser(input: CreateUserInput): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(input.password, 12);

        const user = await this.userRepository.create({
            email: input.email.trim(),
            name: input.name?.trim() || null,
            password: hashedPassword,
            avatar: null,
            provider: null,
            providerId: null,
            role: "USER",
            plan: "FREE",
            planExpiresAt: null,
        });

        // Create personal organization for new user
        await this.createPersonalOrganization(user);

        return user;
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async getUserByProvider(
        provider: string,
        providerId: string
    ): Promise<User | null> {
        return this.userRepository.findByProvider(provider, providerId);
    }

    async createOAuthUser(input: CreateOAuthUserInput): Promise<User> {
        const user = await this.userRepository.create({
            email: input.email.trim(),
            name: input.name?.trim() || null,
            password: null, // OAuth users don't have passwords
            provider: input.provider.trim(),
            providerId: input.providerId.trim(),
            avatar: input.avatar?.trim() || null,
            role: "USER",
            plan: "FREE",
            planExpiresAt: null,
        });

        // Create personal organization for new OAuth user
        await this.createPersonalOrganization(user);

        return user;
    }

    async updateUser(id: string, input: UpdateUserInput): Promise<User> {
        // Validate user exists
        if (!id || id.trim() === "") {
            throw new Error("User ID is required");
        }

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error("User not found");
        }

        const updateData: {
            name?: string | null;
            password?: string | null;
            provider?: string | null;
            providerId?: string | null;
            avatar?: string | null;
        } = {};

        if (input.name !== undefined) {
            updateData.name = input.name?.trim() || null;
        }

        if (input.password) {
            if (input.password.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }
            updateData.password = await bcrypt.hash(input.password, 12);
        }

        if (input.provider !== undefined) {
            updateData.provider = input.provider?.trim() || null;
        }

        if (input.providerId !== undefined) {
            updateData.providerId = input.providerId?.trim() || null;
        }

        if (input.avatar !== undefined) {
            updateData.avatar = input.avatar?.trim() || null;
        }

        return this.userRepository.update(id, updateData);
    }

    async verifyPassword(user: User, password: string): Promise<boolean> {
        if (!user.password) {
            throw new Error("User does not have a password (OAuth account)");
        }
        return bcrypt.compare(password, user.password);
    }

    async getUsers(
        options: { skip?: number; take?: number } = {}
    ): Promise<User[]> {
        return this.userRepository.findMany(options);
    }

    /**
     * Create a personal organization for a new user
     * @private
     */
    private async createPersonalOrganization(user: User): Promise<void> {
        const orgName = user.name ? `${user.name}'s Workspace` : `${user.email}'s Workspace`;
        const orgSlug = `personal-${user.id}`;

        const organization = await this.organizationRepository.createOrganization({
            name: orgName,
            slug: orgSlug,
            description: "Personal workspace",
        });

        await this.organizationRepository.addMember({
            userId: user.id,
            organizationId: organization.id,
            role: "OWNER",
            status: "ACTIVE",
        });
    }
}
