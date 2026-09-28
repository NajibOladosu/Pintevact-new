"use client";

import { useEffect, useRef, useState } from "react";
import { deleteUser, grantCourse, revokeCourse, saveUserProfile, sendReset, setRole, setSuspended } from "@/app/(app)/admin/users/actions";
import { Ban, Key, Plus, Shield, Trash } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import type { UserDetail } from "@/lib/admin/users";
import { FormStatus } from "./course-editor";
import { ConfirmButton } from "./confirm-button";
import { useAdminAction } from "./use-admin-action";
import { useFormAction } from "./use-form-action";
import { useUnsavedChanges } from "./use-unsaved-changes";

export function UserProfileForm({ user }: { user: UserDetail }) {
  const { state, onSubmit, pending } = useFormAction(saveUserProfile);
  const formRef = useRef<HTMLFormElement>(null);
  const { markClean } = useUnsavedChanges(formRef);
  useEffect(() => {
    if (state.ok) markClean();
  }, [state, markClean]);
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="userId" value={user.id} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Name</Label>
          <Input id="fullName" name="fullName" defaultValue={user.fullName ?? ""} />
          <FieldError message={state.errors?.fullName} />
        </div>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={user.headline ?? ""} />
          <FieldError message={state.errors?.headline} />
        </div>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="emailOptIn" defaultChecked={user.emailOptIn} className="h-5 w-5 accent-[var(--accent)]" /> Learning emails on (reminders, digests, announcements)
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="secondary" loading={pending}>
          Save profile
        </Button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}

export function GrantCourse({ userId, courses }: { userId: string; courses: { id: string; title: string }[] }) {
  const [picked, setCourseId] = useState(courses[0]?.id ?? "");
  const { run, pending } = useAdminAction();
  const courseId = courses.some((c) => c.id === picked) ? picked : (courses[0]?.id ?? "");
  if (!courses.length) return <p className="text-sm text-subtle">They already have every course.</p>;
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (courseId) run(() => grantCourse(userId, courseId));
      }}
    >
      <Select aria-label="Course to grant" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="h-11 flex-1">
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="outline" size="sm" className="h-11" loading={pending}>
        <Plus size={15} aria-hidden /> Grant access
      </Button>
    </form>
  );
}

export function RevokeCourse({ userId, courseId, title }: { userId: string; courseId: string; title: string }) {
  const { run } = useAdminAction();
  return (
    <ConfirmButton variant="ghost" size="sm" className="h-8 px-3" title={`Revoke ${title}?`} body="They lose access, but their progress is kept in case you grant it again." confirmLabel="Revoke access" onConfirm={() => run(() => revokeCourse(userId, courseId))}>
      Revoke
    </ConfirmButton>
  );
}

export function UserAccountActions({ user, isSelf }: { user: UserDetail; isSelf: boolean }) {
  const { run, pending } = useAdminAction();
  const suspended = !!user.suspendedUntil;
  return (
    <div className="flex flex-col items-stretch gap-2">
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => run(() => sendReset(user.id, user.email))}>
        <Key size={15} aria-hidden /> Send password reset
      </Button>
      {user.role === "admin" ? (
        <ConfirmButton variant="outline" size="sm" disabled={isSelf} title="Remove admin access?" body={`${user.fullName ?? user.email} goes back to being a learner.`} confirmLabel="Remove admin" onConfirm={() => run(() => setRole(user.id, "student"))}>
          <Shield size={15} aria-hidden /> Remove admin
        </ConfirmButton>
      ) : (
        <ConfirmButton variant="outline" size="sm" tone="primary" title="Make this person an admin?" body="Admins can edit every course, see every learner and send emails to everyone." confirmLabel="Make admin" onConfirm={() => run(() => setRole(user.id, "admin"))}>
          <Shield size={15} aria-hidden /> Make admin
        </ConfirmButton>
      )}
      {suspended ? (
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => run(() => setSuspended(user.id, false))}>
          <Ban size={15} aria-hidden /> Lift suspension
        </Button>
      ) : (
        <ConfirmButton variant="outline" size="sm" disabled={isSelf} title="Suspend this account?" body="They're signed out and can't sign in until you lift it. Nothing is deleted." confirmLabel="Suspend" onConfirm={() => run(() => setSuspended(user.id, true))}>
          <Ban size={15} aria-hidden /> Suspend
        </ConfirmButton>
      )}
      <ConfirmButton
        variant="danger"
        size="sm"
        disabled={isSelf}
        title="Delete this account?"
        body={`This permanently deletes ${user.email} with their progress, reflections, notes and certificates. Receipts stay in Stripe.`}
        confirmLabel="Delete account"
        onConfirm={() => run(() => deleteUser(user.id, user.email), { refresh: false })}
      >
        <Trash size={15} aria-hidden /> Delete account
      </ConfirmButton>
    </div>
  );
}
