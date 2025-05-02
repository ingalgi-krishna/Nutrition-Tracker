// src/app/api/water-intake/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import WaterIntake from '@/models/WaterIntake';
import { verifyToken } from '@/lib/jwt';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get token from cookies
        const token = req.cookies.get('nutritrack_auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const entryId = params.id;

        await connectToDatabase();

        const entry = await WaterIntake.findById(entryId);

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Water intake entry not found' },
                { status: 404 }
            );
        }

        // Check if the user owns this entry
        if (entry.userId.toString() !== decodedToken.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: true, data: entry },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching water intake entry:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get token from cookies
        const token = req.cookies.get('nutritrack_auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const entryId = params.id;
        const body = await req.json();

        await connectToDatabase();

        const entry = await WaterIntake.findById(entryId);

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Water intake entry not found' },
                { status: 404 }
            );
        }

        // Check if user owns this entry
        if (entry.userId.toString() !== decodedToken.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Update fields
        const { amount, method, imageUrl, timestamp } = body;

        if (amount != null) entry.amount = amount;
        if (method) entry.method = method;
        if (imageUrl) entry.imageUrl = imageUrl;
        if (timestamp) entry.timestamp = new Date(timestamp);

        await entry.save();

        return NextResponse.json(
            { success: true, data: entry },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating water intake entry:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get token from cookies
        const token = req.cookies.get('nutritrack_auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const entryId = params.id;

        await connectToDatabase();

        // First check if the entry exists and belongs to this user
        const entry = await WaterIntake.findById(entryId);

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Water intake entry not found' },
                { status: 404 }
            );
        }

        if (entry.userId.toString() !== decodedToken.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Delete the entry
        await WaterIntake.findByIdAndDelete(entryId);

        return NextResponse.json(
            { success: true, data: { message: 'Water intake entry deleted successfully' } },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting water intake entry:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}